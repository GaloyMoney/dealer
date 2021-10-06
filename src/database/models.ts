export interface InFlightTransfer {
  id?: number
  isDepositOnExchange: boolean
  address: string
  transferSizeInSats: number
  memo: string
  isCompleted: boolean
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface WalletObject {
  id: string
  balance: {
    currency: string
    amount: number
  }
}

export interface Wallet {
  id?: number
  jsonData: WalletObject[]
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface LastOnChainAddressObject {
  id: string
}

export interface LastOnChainAddress {
  id?: number
  jsonData: LastOnChainAddressObject
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface OnChainPayObject {
  address: string
  amount: number
  memo: string
}

export interface OnChainPay {
  id?: number
  jsonData: OnChainPayObject
  updatedTimestamp?: string
  createdTimestamp?: string
}
