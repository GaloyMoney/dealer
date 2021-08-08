import { Result } from "./Result"
import { GaloyWallet } from "./GaloyWalletTypes"
import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  gql,
  InMemoryCache,
} from "@apollo/client/core"
import fetch from "node-fetch"
import { pino } from "pino"

const IN_MEMORY_CACHE_CONFIG = {
  typePolicies: {
    Query: {
      fields: {
        wallet: {
          read() {
            return {
              id: "dealer",
              balance: { currency: "USD", amount: -100 },
            }
          },
        },
        getLastOnChainAddress: {
          read() {
            return {
              id: "tb1q740rclcmn0sz6etpxrlmya0x0kudcvgqrhg8tf",
            }
          },
        },
      },
    },
  },
}

const WALLET = gql`
  query wallet {
    wallet @client {
      id
      balance {
        currency
        amount
      }
    }
  }
`

const GET_ONCHAIN_ADDRESS = gql`
  query getLastOnChainAddress {
    getLastOnChainAddress @client {
      id
    }
  }
`
const ONCHAIN_PAY = gql`
  mutation onchain_pay($address: String!, $amount: Int!, $memo: String) {
    onchain {
      pay(address: $address, amount: $amount, memo: $memo) {
        success
      }
    }
  }
`

export class DealerMockWallet implements GaloyWallet {
  client: ApolloClient<NormalizedCacheObject>
  logger: pino.Logger

  constructor(logger: pino.Logger) {
    const GRAPHQL_URI = process.env["GRAPHQL_URI"]
    const httpLink = createHttpLink({ uri: GRAPHQL_URI, fetch })
    const cache = new InMemoryCache(IN_MEMORY_CACHE_CONFIG)
    this.client = new ApolloClient({ link: httpLink, cache: cache })
    this.logger = logger.child({ class: DealerMockWallet.name })
  }

  public async getWalletUsdBalance(): Promise<Result<number>> {
    const logger = this.logger.child({ method: "getWalletUsdBalance()" })
    try {
      const result = await this.client.query({ query: WALLET })
      logger.debug({ result })
      return { ok: true, value: result.data.wallet.balance.amount }
    } catch (error) {
      logger.error({ error })
      return { ok: false, error }
    }
  }

  public async getWalletOnChainDepositAddress(): Promise<Result<string>> {
    const logger = this.logger.child({ method: "getWalletOnChainDepositAddress()" })
    try {
      const result = await this.client.query({ query: GET_ONCHAIN_ADDRESS })
      logger.debug({ result })
      return { ok: true, value: result.data.getLastOnChainAddress.id }
    } catch (error) {
      logger.error({ error })
      return { ok: false, error }
    }
  }

  public async payOnChain(
    address: string,
    btcAmountInSats: number,
    memo: string,
  ): Promise<Result<void>> {
    const logger = this.logger.child({ method: "payOnChain()" })
    try {
      const variables = { address: address, amount: btcAmountInSats, memo: memo }
      const result = await this.client.mutate({
        mutation: ONCHAIN_PAY,
        variables: variables,
      })
      logger.debug({ variables, result })
      return { ok: true, value: undefined }
    } catch (error) {
      logger.error({ error })
      return { ok: false, error }
    }
  }
}
