import { Result } from "./Result"

export interface WalletsBalances {
  btcWalletId: string
  btcWalletBalance: number
  usdWalletId: string
  usdWalletBalance: number
}

export interface GaloyWallet {
  getWalletsBalances(): Promise<Result<WalletsBalances>>

  getUsdWalletBalance(): Promise<Result<number>>
  getBtcWalletBalance(): Promise<Result<number>>

  getWalletOnChainDepositAddress(): Promise<Result<string>>

  payOnChain(
    address: string,
    btcAmountInSats: number,
    memo: string,
  ): Promise<Result<void>>

  // TODO: add => useSubscription for updates
}
