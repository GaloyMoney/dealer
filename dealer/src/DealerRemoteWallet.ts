import { ErrorLevel, Result } from "./Result"
import { GaloyWallet, WalletsBalances } from "./GaloyWalletTypes"
import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  gql,
  InMemoryCache,
} from "@apollo/client/core"
import fetch from "node-fetch"
import { pino } from "pino"
import { cents2usd, sat2btc } from "./utils"
import {
  addAttributesToCurrentSpan,
  asyncRunInSpan,
  recordExceptionInCurrentSpan,
  SemanticAttributes,
} from "./services/tracing"

const IN_MEMORY_CACHE_CONFIG = {
  typePolicies: {
    Query: {
      fields: {
        // wallets: {
        //   read() {
        //     return [
        //       {
        //         id: "BTCWallet",
        //         balance: 1_000_000, // 100 USD in sats @ 10k USD/BTC
        //         walletCurrency: "BTC",
        //       },
        //       {
        //         id: "USDWallet",
        //         balance: -10000, // 100 USD in cents
        //         walletCurrency: "USD",
        //       },
        //     ]
        //   },
        // },
        // getLastOnChainAddress: {
        //   read() {
        //     return {
        //       id: "tb1q740rclcmn0sz6etpxrlmya0x0kudcvgqrhg8tf",
        //     }
        //   },
        // },
      },
    },
  },
}

const WALLETS = gql`
  query wallets {
    wallets {
      id
      balance
      walletCurrency
    }
  }
`

const GET_ONCHAIN_ADDRESS = gql`
  query getLastOnChainAddress {
    getLastOnChainAddress {
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

export class DealerRemoteWallet implements GaloyWallet {
  client: ApolloClient<NormalizedCacheObject>
  logger: pino.Logger

  constructor(logger: pino.Logger) {
    const GRAPHQL_URI = process.env["GRAPHQL_URI"]
    const httpLink = createHttpLink({ uri: GRAPHQL_URI, fetch })
    const cache = new InMemoryCache(IN_MEMORY_CACHE_CONFIG)
    this.client = new ApolloClient({ link: httpLink, cache: cache })
    this.logger = logger.child({ class: DealerRemoteWallet.name })
  }

  public async getWalletsBalances(): Promise<Result<WalletsBalances>> {
    const ret = await asyncRunInSpan(
      "app.dealerRemoteWallet.getWalletsBalances",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletsBalances",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWallet",
      },
      async () => {
        const logger = this.logger.child({ method: "getWalletsBalances()" })
        try {
          const result = await this.client.query({ query: WALLETS })
          logger.debug(
            { WALLET: WALLETS, result },
            "{WALLET} query to galoy graphql api successful with {result}",
          )

          const btcWallet = result.data.wallets?.find(
            (wallet) => wallet?.id === "BTCWallet",
          )
          const btcWalletId = btcWallet?.id
          const btcWalletBalance = btcWallet?.balance ?? NaN

          const usdWallet = result.data.wallets?.find(
            (wallet) => wallet?.id === "USDWallet",
          )
          const usdWalletId = usdWallet?.id
          const usdWalletBalance = usdWallet?.balance ?? NaN

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcWalletId`]: btcWalletId,
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcWalletBalance`]:
              btcWalletBalance,
            [`${SemanticAttributes.CODE_FUNCTION}.results.usdWalletId`]: usdWalletId,
            [`${SemanticAttributes.CODE_FUNCTION}.results.usdWalletBalance`]:
              usdWalletBalance,
          })

          return {
            ok: true,
            value: {
              btcWalletId,
              btcWalletBalance: sat2btc(btcWalletBalance),
              usdWalletId,
              usdWalletBalance: cents2usd(usdWalletBalance),
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { WALLET: WALLETS, error },
            "{WALLET} query to galoy graphql api failed with {error}",
          )
          return { ok: false, error }
        }
      },
    )
    return ret as Result<WalletsBalances>
  }

  public async getUsdWalletBalance(): Promise<Result<number>> {
    const result = await this.getWalletsBalances()
    if (result.ok) {
      return { ok: true, value: result.value.usdWalletBalance }
    }
    return result
  }

  public async getBtcWalletBalance(): Promise<Result<number>> {
    const result = await this.getWalletsBalances()
    if (result.ok) {
      return { ok: true, value: result.value.btcWalletBalance }
    }
    return result
  }

  public async getWalletOnChainDepositAddress(): Promise<Result<string>> {
    const ret = await asyncRunInSpan(
      "app.dealerRemoteWallet.getWalletOnChainDepositAddress",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletOnChainDepositAddress",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWallet",
      },
      async () => {
        const logger = this.logger.child({ method: "getWalletOnChainDepositAddress()" })
        try {
          const result = await this.client.query({ query: GET_ONCHAIN_ADDRESS })
          logger.debug(
            { GET_ONCHAIN_ADDRESS, result },
            "{GET_ONCHAIN_ADDRESS} query to galoy graphql api successful with {result}",
          )
          const btcAddress = result.data?.getLastOnChainAddress?.id ?? undefined

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcAddress`]: btcAddress,
          })

          return { ok: true, value: btcAddress }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { GET_ONCHAIN_ADDRESS, error },
            "{GET_ONCHAIN_ADDRESS} query to galoy graphql api failed with {error}",
          )
          return { ok: false, error }
        }
      },
    )
    return ret as Result<string>
  }

  public async getWalletOnChainTransactionFee(
    address: string,
    btcAmountInSats: number,
  ): Promise<Result<number>> {
    const ret = await asyncRunInSpan(
      "app.dealerRemoteWallet.getWalletOnChainTransactionFee",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletOnChainTransactionFee",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWallet",
        [`${SemanticAttributes.CODE_FUNCTION}.params.address`]: address,
        [`${SemanticAttributes.CODE_FUNCTION}.params.btcAmountInSats`]: btcAmountInSats,
      },
      async () => {
        const logger = this.logger.child({ method: "getWalletOnChainTransactionFee()" })
        try {
          const fee = 0
          logger.debug(
            { address, btcAmountInSats, result: fee },
            "{GET_ONCHAIN_FEE} query to galoy graphql api successful with {result}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.feeAmount`]: fee,
          })

          return { ok: true, value: fee }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { error },
            "{GET_ONCHAIN_FEE} query to galoy graphql api failed with {error}",
          )
          return { ok: false, error }
        }
      },
    )
    return ret as Result<number>
  }

  public async payOnChain(
    address: string,
    btcAmountInSats: number,
    memo: string,
  ): Promise<Result<void>> {
    const ret = await asyncRunInSpan(
      "app.dealerRemoteWallet.payOnChain",
      {
        [SemanticAttributes.CODE_FUNCTION]: "payOnChain",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWallet",
        [`${SemanticAttributes.CODE_FUNCTION}.params.address`]: address,
        [`${SemanticAttributes.CODE_FUNCTION}.params.btcAmountInSats`]: btcAmountInSats,
        [`${SemanticAttributes.CODE_FUNCTION}.params.memo`]: memo,
      },
      async () => {
        const logger = this.logger.child({ method: "payOnChain()" })
        try {
          const variables = { address: address, amount: btcAmountInSats, memo: memo }
          const result = await this.client.mutate({
            mutation: ONCHAIN_PAY,
            variables: variables,
          })
          logger.debug(
            { ONCHAIN_PAY, variables, result },
            "{ONCHAIN_PAY} mutation with {variables} to galoy graphql api successful with {result}",
          )
          return { ok: true, value: undefined }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { ONCHAIN_PAY, error },
            "{ONCHAIN_PAY} mutation to galoy graphql api failed with {error}",
          )
          return { ok: false, error }
        }
      },
    )
    return ret as Result<void>
  }
}
