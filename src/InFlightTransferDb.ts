import fs from "fs"
import pino from "pino"
import { Result } from "./Result"

export enum InFlightTransferStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export enum InFlightTransferDirection {
  WITHDRAW_TO_WALLET = "Withdraw to Wallet",
  DEPOSIT_ON_EXCHANGE = "Deposit on Exchange",
}

export enum InFlightTransferDbError {
  ALREADY_EXIST = "Transfer already exist",
  DOES_NOT_EXIST = "No transfer exist",
}

export class InFlightTransfer {
  public createdTimestamp: string
  public updatedTimestamp: string
  public status: InFlightTransferStatus
  constructor(
    public direction: InFlightTransferDirection,
    public address: string,
    public transferSizeInSats: number,
    public memo: string,
  ) {
    this.createdTimestamp = this.updatedTimestamp = new Date().toISOString()
    this.status = InFlightTransferStatus.PENDING
  }

  public static completed(target: InFlightTransfer): InFlightTransfer {
    const now = new Date()
    now.setSeconds(now.getSeconds() + 1)
    target.updatedTimestamp = now.toISOString()
    target.status = InFlightTransferStatus.COMPLETED
    return target
  }
}

export class InFlightTransferDb {
  public static databaseFileName = "/var/lib/dealer/__InFlightTransferDb.json"
  private transfers: Map<string, InFlightTransfer>
  private logger: pino.Logger

  constructor(logger: pino.Logger) {
    this.logger = logger.child({ class: InFlightTransferDb.name })
    this.transfers = new Map<string, InFlightTransfer>()
    if (!fs.existsSync(InFlightTransferDb.databaseFileName)) {
      const result = this.writeDbFile()
      if (!result.ok) {
        logger.error(
          { databaseFileName: InFlightTransferDb.databaseFileName },
          "Error: writeDbFile() failed on {databaseFileName}",
        )
        throw result.error
      }
    } else {
      const result = this.readDbFile()
      if (!result.ok) {
        logger.error(
          { databaseFileName: InFlightTransferDb.databaseFileName },
          "Error: readDbFile() failed on {databaseFileName}",
        )
        throw result.error
      }
    }
  }

  private writeDbFile(): Result<void> {
    try {
      fs.writeFileSync(
        InFlightTransferDb.databaseFileName,
        JSON.stringify([...this.transfers]),
      )
      return { ok: true, value: undefined }
    } catch (error) {
      this.logger.error(error)
      return { ok: false, error: error }
    }
  }

  private readDbFile(): Result<void> {
    try {
      const data = fs.readFileSync(InFlightTransferDb.databaseFileName)
      this.transfers = new Map<string, InFlightTransfer>(JSON.parse(data.toString()))
      return { ok: true, value: undefined }
    } catch (error) {
      this.logger.error(error)
      return { ok: false, error: error }
    }
  }

  public insertInFlightTransfers(transfer: InFlightTransfer): Result<void> {
    const result = this.readDbFile()
    if (result.ok) {
      const original = this.transfers.get(transfer.address)
      if (original) {
        return {
          ok: false,
          error: new Error(InFlightTransferDbError.ALREADY_EXIST),
        }
      }
      this.transfers.set(transfer.address, transfer)
      const result = this.writeDbFile()
      if (!result.ok) {
        return result
      }
      return { ok: true, value: undefined }
    } else {
      return result
    }
  }

  public completedInFlightTransfers(address: string): Result<void> {
    const result = this.readDbFile()
    if (result.ok) {
      const original = this.transfers.get(address)
      if (!original) {
        return {
          ok: false,
          error: new Error(InFlightTransferDbError.DOES_NOT_EXIST),
        }
      }
      this.transfers.set(original.address, InFlightTransfer.completed(original))
      const result = this.writeDbFile()
      if (!result.ok) {
        return result
      }
      return { ok: true, value: undefined }
    } else {
      return result
    }
  }

  public getThisInFlightTransfer(address: string): Result<InFlightTransfer> {
    const result = this.readDbFile()
    if (result.ok) {
      const transfer = this.transfers.get(address)
      if (transfer) {
        return { ok: true, value: transfer }
      }
      return { ok: false, error: new Error(InFlightTransferDbError.DOES_NOT_EXIST) }
    } else {
      return result
    }
  }

  public getPendingInFlightTransfers(
    direction?: InFlightTransferDirection,
  ): Result<Map<string, InFlightTransfer>> {
    const result = this.readDbFile()
    if (result.ok) {
      const transfers = new Map<string, InFlightTransfer>()
      for (const transfer of this.transfers.values()) {
        if (transfer.status === InFlightTransferStatus.PENDING) {
          if (!direction || transfer.direction === direction) {
            transfers.set(transfer.address, transfer)
          }
        }
      }
      return { ok: true, value: transfers }
    } else {
      return result
    }
  }

  public getAllInFlightTransfers(): Result<Map<string, InFlightTransfer>> {
    const result = this.readDbFile()
    if (result.ok) {
      return { ok: true, value: this.transfers }
    } else {
      return result
    }
  }

  public clear(): Result<void> {
    this.transfers.clear()
    const result = this.writeDbFile()
    if (!result.ok) {
      return result
    }
    return { ok: true, value: undefined }
  }
}
