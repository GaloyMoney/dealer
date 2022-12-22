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
  query accountDefaultWallet($username: Username!, $walletCurrency: WalletCurrency!) {
    accountDefaultWallet(username: $username, walletCurrency: $walletCurrency) {
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

type CreateInvoiceOutput = {
  paymentRequest?: string
  error?: Error
}

async function createInvoice(
  walletId: string,
  amount: number,
  metadata: string,
): Promise<CreateInvoiceOutput> {
  const descriptionHash = crypto.createHash("sha256").update(metadata).digest("hex")

  const {
    data: {
      mutationData: { errors, invoice },
    },
  } = await client.mutate({
    mutation: LNURL_INVOICE,
    variables: {
      walletId,
      amount,
      descriptionHash,
    },
  })
  if (errors && errors.length) {
    throw new Error(`Failed to get invoice: ${errors[0].message}`)
  }
  return invoice
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username, amount } = req.query
  const url = originalUrl(req)

  console.log({ headers: req.headers }, "request to NextApiRequest")

  const accountUsername = username ? username.toString() : ""
  const metadata = JSON.stringify([
    ["text/plain", `Payment to ${username}`],
    ["text/identifier", `${username}@${url.hostname}`],
  ])
  let walletId: string

  try {
    const { data } = await client.query({
      query: ACCOUNT_DEFAULT_WALLET,
      variables: { username: accountUsername, walletCurrency: "BTC" },
      context: {
        "x-real-ip": req.headers["x-real-ip"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
    })
    walletId = data?.accountDefaultWallet?.id ? data?.accountDefaultWallet?.id : ""
  } catch (err) {
    return res.json({
      status: "ERROR",
      reason: `Couldn't find user '${username}'.`,
    })
  }

  if (amount) {
    if (Array.isArray(amount)) {
      throw new Error("Invalid request")
    }
    const amountSats = Math.round(parseInt(amount, 10) / 1000)
    if ((amountSats * 1000).toString() !== amount) {
      return res.json({
        status: "ERROR",
        reason: "Millisatoshi amount is not supported, please send a value in full sats.",
      })
    }
    const { paymentRequest, error } = await createInvoice(walletId, amountSats, metadata)
    if (error instanceof Error) {
      return res.json({
        status: "ERROR",
        reason: error instanceof Error ? error.message : "unexpected error",
      })
    }
    return res.json({
      pr: paymentRequest,
      routes: [],
    })
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
