import { Result } from "./Result"

export interface GaloyWallet {
  getWalletUsdBalance(): Promise<Result<number>>
  getWalletBtcBalance(): Promise<Result<number>>
  getWalletOnChainDepositAddress(): Promise<Result<string>>
  payOnChain(
    address: string,
    btcAmountInSats: number,
    memo: string,
  ): Promise<Result<void>>
}
