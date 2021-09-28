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
