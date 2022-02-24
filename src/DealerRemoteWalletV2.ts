import { Result } from "./Result"
import { GaloyWallet, WalletsBalances } from "./GaloyWalletTypes"
import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core"
import fetch from "node-fetch"
import { pino } from "pino"
import { cents2usd, sat2btc } from "./utils"

import { QUERIES, MUTATIONS } from "@galoymoney/client"

export class DealerRemoteWalletV2 implements GaloyWallet {
  client: ApolloClient<NormalizedCacheObject>
  phoneNumber: string
  authCode: string
  galoyJwtToken: string | undefined
  logger: pino.Logger

  constructor(logger: pino.Logger) {
    const GRAPHQL_URI = process.env["GRAPHQL_URI"]
    const httpLink = createHttpLink({ uri: GRAPHQL_URI, fetch })
    const cache = new InMemoryCache()
    this.client = new ApolloClient({ link: httpLink, cache: cache })
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
    return
  }

  private isAuthenticated() {
    return !!this.galoyJwtToken
  }

  public async getWalletsBalances(): Promise<Result<WalletsBalances>> {
    const logger = this.logger.child({ method: "getWalletsBalances()" })
    const variables = { hasToken: this.isAuthenticated(), recentTransactions: 0 }
    try {
      const result = await this.client.query({
        query: QUERIES.main,
        variables: variables,
      })
      logger.debug(
        { query: QUERIES.main, variables, result },
        "{query} with {variables} to galoy graphql api successful with {result}",
      )

      const me = result.data?.me
      const btcWallet = me?.defaultAccount?.wallets?.find(
        (wallet) => wallet?.__typename === "BTCWallet",
      )
      const btcWalletId = btcWallet?.id
      const btcWalletBalance = btcWallet?.balance ?? NaN

      // TODO upgrade to USDWallet when the Galoy-Client does
      const usdWallet = me?.defaultAccount?.wallets?.find(
        (wallet) => wallet?.__typename !== "BTCWallet",
      )
      const usdWalletId = usdWallet?.id
      const usdWalletBalance = usdWallet?.balance ?? NaN

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
      logger.error(
        { query: QUERIES.main, variables, error },
        "{query} with {variables} to galoy graphql api failed with {error}",
      )
      return { ok: false, error }
    }
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
    const logger = this.logger.child({ method: "getWalletOnChainDepositAddress()" })
    try {
      const walletsResult = await this.getWalletsBalances()
      if (!walletsResult.ok) {
        return walletsResult
      }
      const variables = { walletId: walletsResult.value.btcWalletId }
      const result = await this.client.mutate({
        mutation: MUTATIONS.onChainAddressCurrent,
        variables: variables,
      })
      logger.debug(
        { mutation: MUTATIONS.onChainAddressCurrent, variables, result },
        "{mutation} with {variables} to galoy graphql api successful with {result}",
      )
      const btcAddress = result.data?.onChainAddressCurrent?.address ?? undefined
      return { ok: true, value: btcAddress }
    } catch (error) {
      logger.error(
        { mutation: MUTATIONS.onChainAddressCurrent, error },
        "{mutation} to galoy graphql api failed with {error}",
      )
      return { ok: false, error }
    }
  }

  public async getWalletOnChainTransactionFee(
    address: string,
    btcAmountInSats: number,
  ): Promise<Result<number>> {
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
      const btcAddress = result.data?.onChainTxFee?.amount ?? undefined
      return { ok: true, value: btcAddress }
    } catch (error) {
      logger.error(
        { query: QUERIES.onChainTxFee, address, btcAmountInSats, error },
        "{query} to galoy graphql api failed with {error}",
      )
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
      const result = await this.client.mutate({
        mutation: MUTATIONS.onChainPaymentSend,
        variables: variables,
      })
      logger.debug(
        { mutation: MUTATIONS.onChainAddressCurrent, variables, result },
        "{mutation} with {variables} to galoy graphql api successful with {result}",
      )
      return { ok: true, value: undefined }
    } catch (error) {
      logger.error(
        { mutation: MUTATIONS.onChainAddressCurrent, error },
        "{mutation} to galoy graphql api failed with {error}",
      )
      return { ok: false, error }
    }
  }
}
