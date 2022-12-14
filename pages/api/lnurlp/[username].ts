import crypto from "crypto"
import originalUrl from "original-url"
import {
  ApolloClient,
  ApolloLink,
  concat,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import type { NextApiRequest, NextApiResponse } from "next"

import { GRAPHQL_URI_INTERNAL } from "../../../lib/config"

const ipForwardingMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      "x-real-ip": operation.getContext()["x-real-ip"],
      "x-forwarded-for": operation.getContext()["x-forwarded-for"],
    },
  }))

  return forward(operation)
})

const client = new ApolloClient({
  link: concat(
    ipForwardingMiddleware,
    new HttpLink({
      uri: GRAPHQL_URI_INTERNAL,
    }),
  ),
  cache: new InMemoryCache(),
})

const ACCOUNT_DEFAULT_WALLET = gql`
  query accountDefaultWallet($username: Username!) {
    accountDefaultWallet(username: $username) {
      __typename
      id
      walletCurrency
    }
  }
`

const LNURL_INVOICE = gql`
  mutation lnInvoiceCreateOnBehalfOfRecipient(
    $walletId: WalletId!
    $amount: SatAmount!
    $descriptionHash: Hex32Bytes!
  ) {
    mutationData: lnInvoiceCreateOnBehalfOfRecipient(
      input: {
        recipientWalletId: $walletId
        amount: $amount
        descriptionHash: $descriptionHash
      }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

const LNURL_USD_INVOICE = gql`
  mutation lnUsdInvoiceCreateOnBehalfOfRecipient(
    $walletId: WalletId!
    $amount: SatAmount!
    $descriptionHash: Hex32Bytes!
  ) {
    mutationData: lnUsdInvoiceCreateOnBehalfOfRecipient(
      input: {
        recipientWalletId: $walletId
        amount: $amount
        descriptionHash: $descriptionHash
      }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username, amount } = req.query
  const url = originalUrl(req)
  let accountUsername: string
  if (username == undefined) {
    accountUsername = ""
  } else {
    accountUsername = username.toString()
  }
  let walletId
  let walletCurrency

  try {
    const { data } = await client.query({
      query: ACCOUNT_DEFAULT_WALLET,
      variables: { username: accountUsername },
      context: {
        "x-real-ip": req.headers["x-real-ip"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
    })
    walletId = data?.accountDefaultWallet?.id ? data?.accountDefaultWallet?.id : ""
    walletCurrency = data?.accountDefaultWallet?.walletCurrency
  } catch (error) {
    return res.json({
      status: "ERROR",
      reason: `Couldn't find user '${username}'.`,
    })
  }

  console.log({ headers: req.headers }, "request to NextApiRequest")

  const metadata = JSON.stringify([
    ["text/plain", `Payment to ${username}`],
    ["text/identifier", `${username}@${url.hostname}`],
  ])

  if (amount) {
    if (Array.isArray(amount)) {
      throw new Error("Invalid request")
    }
    // second call, return invoice
    const amountSats = Math.round(parseInt(amount, 10) / 1000)
    if ((amountSats * 1000).toString() !== amount) {
      return res.json({
        status: "ERROR",
        reason: "Millisatoshi amount is not supported, please send a value in full sats.",
      })
    }

    try {
      const descriptionHash = crypto.createHash("sha256").update(metadata).digest("hex")
      if (walletCurrency === "BTC") {
        const {
          data: {
            mutationData: { errors, invoice },
          },
        } = await client.mutate({
          mutation: LNURL_INVOICE,
          variables: {
            walletId,
            amount: amountSats,
            descriptionHash,
          },
        })
        if (errors && errors.length) {
          console.log("error getting invoice", errors)
          return res.json({
            status: "ERROR",
            reason: `Failed to get invoice: ${errors[0].message}`,
          })
        }
        return res.json({
          pr: invoice.paymentRequest,
          routes: [],
        })
      } else {
        const {
          data: {
            mutationData: { errors, invoice },
          },
        } = await client.mutate({
          mutation: LNURL_USD_INVOICE,
          variables: {
            walletId,
            amount: amountSats,
            descriptionHash,
          },
        })
        if (errors && errors.length) {
          console.log("error getting invoice", errors)
          return res.json({
            status: "ERROR",
            reason: `Failed to get invoice: ${errors[0].message}`,
          })
        }
        return res.json({
          pr: invoice.paymentRequest,
          routes: [],
        })
      }
    } catch (err: unknown) {
      console.log("unexpected error getting invoice", err)
      res.json({
        status: "ERROR",
        reason: err instanceof Error ? err.message : "unexpected error",
      })
    }
  } else {
    // first call
    res.json({
      callback: url.full,
      minSendable: 1000,
      maxSendable: 500000000,
      metadata: metadata,
      tag: "payRequest",
    })
  }
}
