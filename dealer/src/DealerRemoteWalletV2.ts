import "cross-fetch/polyfill" // The Apollo client depends on fetch
import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
  gql,
} from "@apollo/client/core"
import { setContext } from "@apollo/client/link/context"
import { pino } from "pino"

import { QUERIES, MUTATIONS } from "@galoymoney/client"

import { cents2usd, sat2btc } from "./utils"

import { GaloyWallet, WalletsBalances } from "./GaloyWalletTypes"
import { ErrorLevel, Result } from "./Result"
import {
  addAttributesToCurrentSpan,
  asyncRunInSpan,
  recordExceptionInCurrentSpan,
  SemanticAttributes,
} from "./services/tracing"

const BALANCE_QUERY = gql`
  query walletsBalance {
    me {
      defaultAccount {
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

export class DealerRemoteWalletV2 implements GaloyWallet {
  client: ApolloClient<NormalizedCacheObject>
  httpLink: ApolloLink
  phoneNumber: string
  authCode: string
  galoyJwtToken: string | undefined
  logger: pino.Logger

  constructor(logger: pino.Logger) {
    const GRAPHQL_URI = process.env["GRAPHQL_URI"]
    this.httpLink = createHttpLink({ uri: GRAPHQL_URI })
    const cache = new InMemoryCache()
    this.client = new ApolloClient({ link: this.httpLink, cache: cache })
    this.logger = logger.child({ class: DealerRemoteWalletV2.name })

    if (!process.env["DEALER_PHONE"] || !process.env["DEALER_CODE"]) {
      throw new Error("INVALID_LOGIN_REQUEST")
    }
    this.phoneNumber = process.env["DEALER_PHONE"]
    this.authCode = process.env["DEALER_CODE"]
    this.galoyJwtToken = process.env["DEALER_TOKEN"]
  }

  public async login(): Promise<undefined> {
    if (!this.galoyJwtToken) {
      const { data } = await this.client.mutate({
        mutation: MUTATIONS.userLogin,
        variables: { input: { phone: this.phoneNumber, code: this.authCode } },
      })

      if (data?.userLogin?.errors?.length > 0 || !data?.userLogin?.authToken) {
        throw new Error(data?.userLogin?.errors?.[0].message || "Something went wrong")
      }

      this.galoyJwtToken = data?.userLogin?.authToken
    }

    if (this.galoyJwtToken) {
      const authLink = setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: `Bearer ${this.galoyJwtToken}`,
          },
        }
      })

      this.client.setLink(authLink.concat(this.httpLink))

      process.env["DEALER_TOKEN"] = this.galoyJwtToken
    }
    return
  }

  private isAuthenticated() {
    return !!this.galoyJwtToken
  }

  public async getWalletsBalances(): Promise<Result<WalletsBalances>> {
    const ret = await asyncRunInSpan(
      "app.dealerRemoteWalletV2.getWalletsBalances",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletsBalances",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWalletV2",
      },
      async () => {
        const btcBalanceOffset = Number(process.env["DEALER_BTC_BAL_OFFSET"] ?? 0)
        const usdBalanceOffset = Number(process.env["DEALER_USD_BAL_OFFSET"] ?? 0)

        const logger = this.logger.child({ method: "getWalletsBalances()" })
        try {
          const result = await this.client.query({ query: BALANCE_QUERY })
          logger.debug(
            { query: BALANCE_QUERY, result },
            "{query} to galoy graphql api successful with {result}",
          )

          const me = result.data?.me
          const btcWallet = me?.defaultAccount?.wallets?.find(
            (wallet) => wallet.walletCurrency === "BTC",
          )
          const btcWalletId = btcWallet?.id
          const btcWalletBalance: number = (btcWallet?.balance ?? NaN) - btcBalanceOffset

          const usdWallet = me?.defaultAccount?.wallets?.find(
            (wallet) => wallet.walletCurrency === "USD",
          )
          const usdWalletId = usdWallet?.id
          const usdWalletBalance: number = (usdWallet?.balance ?? NaN) - usdBalanceOffset

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcWalletId`]: btcWalletId,
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcWalletBalance`]:
              String(btcWalletBalance),
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcBalanceOffset`]:
              String(btcBalanceOffset),
            [`${SemanticAttributes.CODE_FUNCTION}.results.usdWalletId`]: usdWalletId,
            [`${SemanticAttributes.CODE_FUNCTION}.results.usdWalletBalance`]:
              String(usdWalletBalance),
            [`${SemanticAttributes.CODE_FUNCTION}.results.usdBalanceOffset`]:
              String(usdBalanceOffset),
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
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Critical })
          logger.error(
            { query: BALANCE_QUERY, error },
            "{query} to galoy graphql api failed with {error}",
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

  public async getBtcWalletId(): Promise<Result<string>> {
    const result = await this.getWalletsBalances()
    if (result.ok) {
      return { ok: true, value: result.value.btcWalletId }
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
      "app.dealerRemoteWalletV2.getWalletOnChainDepositAddress",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletOnChainDepositAddress",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWalletV2",
      },
      async () => {
        const logger = this.logger.child({ method: "getWalletOnChainDepositAddress()" })
        try {
          const walletsResult = await this.getWalletsBalances()
          if (!walletsResult.ok) {
            return walletsResult
          }
          const variables = { input: { walletId: walletsResult.value.btcWalletId } }
          const result = await this.client.mutate({
            mutation: MUTATIONS.onChainAddressCurrent,
            variables: variables,
          })
          logger.debug(
            { mutation: MUTATIONS.onChainAddressCurrent, variables, result },
            "{mutation} with {variables} to galoy graphql api successful with {result}",
          )
          const btcAddress = result.data?.onChainAddressCurrent?.address ?? undefined

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.btcAddress`]: btcAddress,
          })

          return { ok: true, value: btcAddress }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { mutation: MUTATIONS.onChainAddressCurrent, error },
            "{mutation} to galoy graphql api failed with {error}",
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
      "app.dealerRemoteWalletV2.getWalletOnChainTransactionFee",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getWalletOnChainTransactionFee",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWalletV2",
        [`${SemanticAttributes.CODE_FUNCTION}.params.address`]: address,
        [`${SemanticAttributes.CODE_FUNCTION}.params.btcAmountInSats`]: btcAmountInSats,
      },
      async () => {
        const logger = this.logger.child({ method: "getWalletOnChainTransactionFee()" })
        try {
          const walletsResult = await this.getWalletsBalances()
          if (!walletsResult.ok) {
            return walletsResult
          }
          const variables = {
            walletId: walletsResult.value.btcWalletId,
            address: address,
            amount: btcAmountInSats,
          }
          const result = await this.client.query({
            query: QUERIES.onChainTxFee,
            variables: variables,
          })
          logger.debug(
            { query: QUERIES.onChainTxFee, variables, result },
            "{query} with {variables} to galoy graphql api successful with {result}",
          )
          const feeAmount = result.data?.onChainTxFee?.amount ?? undefined

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.feeAmount`]: feeAmount,
          })

          return { ok: true, value: feeAmount }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          logger.error(
            { query: QUERIES.onChainTxFee, address, btcAmountInSats, error },
            "{query} to galoy graphql api failed with {error}",
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
      "app.dealerRemoteWalletV2.payOnChain",
      {
        [SemanticAttributes.CODE_FUNCTION]: "payOnChain",
        [SemanticAttributes.CODE_NAMESPACE]: "app.dealerRemoteWalletV2",
        [`${SemanticAttributes.CODE_FUNCTION}.params.address`]: address,
        [`${SemanticAttributes.CODE_FUNCTION}.params.btcAmountInSats`]: btcAmountInSats,
        [`${SemanticAttributes.CODE_FUNCTION}.params.memo`]: memo,
      },
      async () => {
        const logger = this.logger.child({ method: "payOnChain()" })
        try {
          const walletsResult = await this.getWalletsBalances()
          if (!walletsResult.ok) {
            return walletsResult
          }
          const variables = {
            input: {
              address: address,
              amount: btcAmountInSats,
              memo: memo,
              walletId: walletsResult.value.btcWalletId,
            },
          }
          const { data } = await this.client.mutate({
            mutation: MUTATIONS.onChainPaymentSend,
            variables: variables,
          })

          logger.debug(
            { mutation: MUTATIONS.onChainAddressCurrent, variables, result: data },
            "{mutation} with {variables} to galoy graphql api successful with {result}",
          )

          if (
            data?.onChainPaymentSend?.errors?.length > 0 ||
            !data?.onChainPaymentSend?.status ||
            data?.onChainPaymentSend?.status === "FAILURE"
          ) {
            return {
              ok: false,
              error: new Error(
                data?.userLogin?.errors?.[0].message ||
                  "MUTATIONS.onChainAddressCurrent failed",
              ),
            }
          }

          return { ok: true, value: undefined }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Critical })
          logger.error(
            { mutation: MUTATIONS.onChainAddressCurrent, error },
            "{mutation} to galoy graphql api failed with {error}",
          )
          return { ok: false, error }
        }
      },
    )
    return ret as Result<void>
  }
}
