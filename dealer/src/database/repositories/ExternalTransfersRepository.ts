import pino from "pino"
import { IDatabase, IMain } from "pg-promise"

import { Md5 } from "ts-md5/dist/md5"

import { ExternalTransfer } from "../models"
import { externalTransfersQueries as sql } from "../sql"
import { Result } from "../../Result"

export class ExternalTransfersRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: ExternalTransfersRepository.name })
  }

  public async insert(transfer: ExternalTransfer): Promise<Result<ExternalTransfer>> {
    try {
      // Clear nullables
      if (!transfer.chain) {
        delete transfer.chain
      }
      if (!transfer.transferId) {
        delete transfer.transferId
      }

      const result = await this.db.one(
        sql.insert,
        {
          isDepositNotWithdrawal: transfer.isDepositNotWithdrawal,
          currency: transfer.currency,
          quantity: transfer.quantity,
          destinationAddressTypeId: transfer.destinationAddressTypeId,
          toAddress: transfer.toAddress,
          fundPasswordMd5: Md5.hashStr(transfer.fundPassword),
          fee: transfer.fee,
          chain: transfer.chain,
          transferId: transfer.transferId,
          success: transfer.success,
        },
        ExternalTransfersRepository.callBack,
      )
      this.logger.info(
        { transfer, result },
        "insertExternalTransfer({transfer}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, transfer },
        "Error: insertExternalTransfer({transfer}) failed.",
      )
      return { ok: false, error: error }
    }
  }

  public async getCount(): Promise<Result<number>> {
    try {
      const rowCount = await this.db.one(
        sql.get_count,
        [],
        (a: { count: string }) => +a.count,
      )
      this.logger.info({ rowCount }, "getCount() returned: {result}.")

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getCount() failed.")
      return { ok: false, error: error }
    }
  }

  public async clearAll(): Promise<Result<void>> {
    try {
      await this.db.none(sql.clear)
      return { ok: true, value: undefined }
    } catch (error) {
      this.logger.error({ error }, "Error: clearAll() failed.")
      return { ok: false, error: error }
    }
  }

  private static callBack(transfer: ExternalTransfer): ExternalTransfer {
    return transfer
  }
}
