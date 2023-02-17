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
import Redis from "ioredis"

import { GRAPHQL_URI_INTERNAL, NOSTR_PUBKEY } from "../../../lib/config"

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
        paymentHash
      }
    }
  }
`

type CreateInvoiceOutput = {
  invoice?: {
    paymentRequest: string
    paymentHash: string
  }
  errors?: {
    message: string
  }[]
}

type CreateInvoiceParams = {
  walletId: string
  amount: number
  descriptionHash: string
}

async function createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceOutput> {
  const {
    data: {
      mutationData: { errors, invoice },
    },
  } = await client.mutate({
    mutation: LNURL_INVOICE,
    variables: params,
  })

  return { errors, invoice }
}

const nostrEnabled = !!NOSTR_PUBKEY

let redis: Redis | null = null

if (nostrEnabled) {
  const connectionObj = {
    sentinelPassword: process.env.REDIS_PASSWORD,
    sentinels: [
      {
        host: `${process.env.REDIS_0_DNS}`,
        port: Number(process.env.REDIS_0_SENTINEL_PORT) || 26379,
      },
      {
        host: `${process.env.REDIS_1_DNS}`,
        port: Number(process.env.REDIS_1_SENTINEL_PORT) || 26379,
      },
      {
        host: `${process.env.REDIS_2_DNS}`,
        port: Number(process.env.REDIS_2_SENTINEL_PORT) || 26379,
      },
    ],
    name: process.env.REDIS_MASTER_NAME ?? "mymaster",
    password: process.env.REDIS_PASSWORD,
  }

  redis = new Redis(connectionObj)

  redis.on("error", (err) => console.log({ err }, "Redis error"))
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  console.log(NOSTR_PUBKEY)

  const { username, amount, nostr } = req.query
  const url = originalUrl(req)
  const accountUsername = username ? username.toString() : ""

  const walletId = await getUserWalletId(accountUsername, req)
  if (!walletId) {
    return res.json({
      status: "ERROR",
      reason: `Couldn't find user '${username}'.`,
    })
  }

  const metadata = JSON.stringify([
    ["text/plain", `Payment to ${accountUsername}`],
    ["text/identifier", `${accountUsername}@${url.hostname}`],
  ])

  // lnurl options call
  if (!amount) {
    return res.json({
      callback: url.full,
      minSendable: 1000,
      maxSendable: 100000000000,
      metadata: metadata,
      tag: "payRequest",
      ...(nostrEnabled
        ? {
            allowsNostr: true,
            nostrPubkey: NOSTR_PUBKEY,
          }
        : {}),
    })
  }

  // lnurl generate invoice
  try {
    if (Array.isArray(amount) || Array.isArray(nostr)) {
      throw new Error("Invalid request")
    }

    const amountSats = Math.round(parseInt(amount, 10) / 1000)
    if ((amountSats * 1000).toString() !== amount) {
      return res.json({
        status: "ERROR",
        reason: "Millisatoshi amount is not supported, please send a value in full sats.",
      })
    }

    let descriptionHash: string

    if (nostrEnabled && nostr) {
      descriptionHash = crypto.createHash("sha256").update(nostr).digest("hex")
    } else {
      descriptionHash = crypto.createHash("sha256").update(metadata).digest("hex")
    }

    const { invoice, errors } = await createInvoice({
      walletId,
      amount: amountSats,
      descriptionHash,
    })

    if ((errors && errors.length) || !invoice) {
      console.log("error getting invoice", errors)
      return res.json({
        status: "ERROR",
        reason: `Failed to get invoice: ${errors ? errors[0].message : "unknown error"}`,
      })
    }

    if (nostrEnabled && nostr && redis) {
      redis.set(`nostrInvoice:${invoice.paymentHash}`, nostr, "EX", 1440)
    }

    return res.json({
      pr: invoice.paymentRequest,
      routes: [],
    })
  } catch (err: unknown) {
    console.log("unexpected error getting invoice", err)
    res.json({
      status: "ERROR",
      reason: err instanceof Error ? err.message : "unexpected error",
    })
  }
}

const getUserWalletId = async (accountUsername: string, req: NextApiRequest) => {
  try {
    const { data } = await client.query({
      query: ACCOUNT_DEFAULT_WALLET,
      variables: { username: accountUsername, walletCurrency: "BTC" },
      context: {
        "x-real-ip": req.headers["x-real-ip"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
    })
    return data?.accountDefaultWallet?.id
  } catch (err) {
    console.log("error getting user wallet id:", err)
    return undefined
  }
}
