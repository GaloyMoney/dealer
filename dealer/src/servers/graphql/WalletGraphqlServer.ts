import { AddressInfo } from "net"

import dotenv from "dotenv"
import {
  stringLength,
  ValidateDirectiveVisitor,
  range,
  pattern,
} from "@profusion/apollo-validation-directives"
import { ApolloServer, gql } from "apollo-server-express"
import express from "express"
import { makeExecutableSchema } from "graphql-tools"
import { applyMiddleware } from "graphql-middleware"
import pino from "pino"
import PinoHttp from "pino-http"
import { v4 as uuidv4 } from "uuid"

import { db as database } from "../../database"

import { baseLogger } from "../../services/logger"

const graphqlLogger = baseLogger.child({ module: "graphql" })

dotenv.config()

const pino_http = PinoHttp({
  logger: graphqlLogger,
  wrapSerializers: false,

  // Define custom serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: (res) => ({
      // FIXME: kind of a hack. body should be in in req. but have not being able to do it.
      body: res.req.body,
      ...pino.stdSerializers.res(res),
    }),
  },
  autoLogging: {
    ignorePaths: ["/healthz"],
  },
})

export async function startApolloServer() {
  const app = express()

  const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    # ?: Mixed vs currency types
    enum Currency {
      USD
      BTC
    }

    # An amount (of a currency) that can be negative (i.g. in a transaction)
    scalar SignedAmount

    # ?: Account? Multiple wallets
    type Wallet {
      id: ID!
      walletCurrency: Currency!
      balance: SignedAmount!
    }

    type LastOnChainAddress {
      id: ID
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
      wallets: [Wallet]
      getLastOnChainAddress: LastOnChainAddress
    }

    type Success {
      success: Boolean
    }

    type OnChain {
      getNewAddress: String

      pay(
        address: String! @pattern(regexp: "^[A-Za-z0-9]+$", policy: THROW)
        amount: Int! @range(min: 0, policy: THROW)
        memo: String @stringLength(max: 1024, policy: THROW) # TODO: add limit on the mobile app
      ): Success

      payAll(
        address: String! @pattern(regexp: "^[A-Za-z0-9]+$", policy: THROW)
        memo: String @stringLength(max: 1024, policy: THROW) # TODO: add limit on the mobile app
      ): Success

      getFee(
        address: String! @pattern(regexp: "^[A-Za-z0-9]+$", policy: THROW)
        amount: Int @range(min: 0, policy: THROW)
      ): Int # sats
    }

    type Mutation {
      onchain: OnChain
    }
  `

  const resolvers = {
    Query: {
      wallets: async (_, __, { logger }) => {
        const result = await database.graphql.getWallet()
        logger.debug({ result }, "wallet: database.getWallet() returned: {result}")
        if (result.ok && result.value && result.value.jsonData) {
          return result.value.jsonData
        }
        return []
      },
      getLastOnChainAddress: async (_, __, { logger }) => {
        const result = await database.graphql.getLastOnChainAddress()
        logger.debug(
          { result },
          "getLastOnChainAddress: database.getLastOnChainAddress() returned: {result}",
        )
        if (result.ok && result.value && result.value.jsonData) {
          return result.value.jsonData
        }
        return ""
      },
    },
    Mutation: {
      onchain: async (_, __, { logger }) => ({
        pay: async ({ address, amount, memo }) => {
          const data = { address, amount, memo }
          const jsonData = JSON.stringify(data)
          const result = await database.graphql.setOnChainPay(jsonData)
          logger.debug(
            { data, jsonData, result },
            "onchain.pay: database.graphql.setOnChainPay({jsonData}) returned: {result}",
          )
          return { success: result.ok }
        },
      }),
    },
  }

  const execSchema = makeExecutableSchema({
    typeDefs: [
      typeDefs,
      ...ValidateDirectiveVisitor.getMissingCommonTypeDefs(),
      ...range.getTypeDefs(),
      ...pattern.getTypeDefs(),
      ...stringLength.getTypeDefs(),
    ],
    // @ts-expect-error: TODO
    schemaDirectives: { pattern, range, stringLength },
    resolvers,
    // plugins: [myPlugin],
  })

  ValidateDirectiveVisitor.addValidationResolversToSchema(execSchema)

  const schema = applyMiddleware(execSchema)

  const server = new ApolloServer({
    schema,
    context: async (context) => {
      // @ts-expect-error: TODO
      const token = context.req?.token ?? null
      const uid = token?.uid ?? null
      const ip = context.req?.headers["x-real-ip"]

      // TODO move from id: uuidv4() to a Jaeger standard
      const logger = graphqlLogger.child({ token, id: uuidv4(), body: context.req?.body })

      return {
        ...context,
        logger,
        uid,
        ip,
      }
    },
    formatError: (err) => {
      const log = err.extensions?.exception?.log

      // An err object needs to necessarily have the forwardToClient field to be forwarded
      // i.e. catch-all errors will not be forwarded
      if (log) {
        const errObj = { message: err.message, code: err.extensions?.code }

        // we are logging additional details but not sending those to the client
        // ex: fields that indicate whether a payment succeeded or not, or stacktraces, that are required
        // for metrics or debugging
        // the err.extensions.metadata field contains such fields
        log({ ...errObj, ...err.extensions?.metadata })
        if (err.extensions?.exception.forwardToClient) {
          return errObj
        }
      } else {
        graphqlLogger.error(err)
      }

      return new Error("Internal server error")
    },
  })

  app.use(pino_http)

  // Health check
  app.get("/healthz", async (req, res) => {
    res.send("OK")
  })

  server.applyMiddleware({ app })

  const httpServer = await app.listen({ port: 4000, host: "0.0.0.0" })
  if (httpServer) {
    const addressInfo = httpServer.address() as AddressInfo
    const address = addressInfo ? addressInfo.address : "unknown"
    const port = addressInfo ? addressInfo.port : "4000"
    console.log(`🚀 Server ready at http://${address}:${port}${server.graphqlPath}`)
  } else {
    graphqlLogger.error({ httpServer }, "app.listen() returned invalid {httpServer}")
    console.log(`🚀 Server may have a problem binding`)
  }
  return { server, app, httpServer }
}

startApolloServer().catch((err) => graphqlLogger.error(err, "server error"))
