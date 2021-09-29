import pino from "pino"
import { IDatabase, IMain } from "pg-promise"
import { IResult } from "pg-promise/typescript/pg-subset"
import { InFlightTransfer } from "../models"
import { inFlightTransfersQueries as sql } from "../sql"
import { Result } from "../../Result"

export class InFlightTransfersRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: InFlightTransfersRepository.name })
  }

  private static transferSizeInSatsAsInteger(
    transfer: InFlightTransfer,
  ): InFlightTransfer {
    transfer.transferSizeInSats = parseInt(`${transfer.transferSizeInSats}`)
    return transfer
  }

  public async insertInFlightTransfer(
    transfer: InFlightTransfer,
  ): Promise<Result<InFlightTransfer>> {
    try {
      const result = await this.db.one(
        sql.insert,
        {
          isDepositOnExchange: transfer.isDepositOnExchange,
          address: transfer.address,
          transferSizeInSats: transfer.transferSizeInSats,
          memo: transfer.memo,
          isCompleted: transfer.isCompleted,
        },
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info(
        { transfer, result },
        "insertInFlightTransfer({transfer}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, transfer },
        "Error: insertInFlightTransfer({transfer}) failed.",
      )
      return { ok: false, error: error }
    }
  }

  public async completedInFlightTransfer(address: string): Promise<Result<number>> {
    try {
      const rowCount = await this.db.tx("update-completed", async (t) => {
        return await t.result(sql.complete, { address }, (r: IResult) => r.rowCount)
      })
      if (rowCount !== 1) {
        throw new Error(`completedInFlightTransfer({address}) updated ${rowCount} rows.`)
      }
      this.logger.info(
        { address, rowCount },
        "completedInFlightTransfer({address}) returned: {rowCount}.",
      )
      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error(
        { error, address },
        "Error: completedInFlightTransfer({address}) failed.",
      )
      return { ok: false, error: error }
    }
  }

  public async getThisInFlightTransfer(
    address: string,
  ): Promise<Result<InFlightTransfer[]>> {
    try {
      const result = await this.db.each(
        sql.get_this,
        { address },
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info(
        { address, result },
        "getThisInFlightTransfer({address}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, address },
        "Error: getThisInFlightTransfer({address}) failed.",
      )
      return { ok: false, error: error }
    }
  }

  public async getPendingInFlightTransfers(): Promise<
    Result<Map<string, InFlightTransfer[]>>
  > {
    try {
      const result = await this.db.each(
        sql.get_pending,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getPendingInFlightTransfers() returned: {result}.")

      const transfers = new Map<string, InFlightTransfer[]>()
      for (const transfer of result) {
        if (!transfers.has(transfer.address)) {
          transfers.set(transfer.address, [transfer])
        } else {
          transfers[transfer.address].push(transfer)
        }
      }

      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingInFlightTransfers() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingInFlightTransfersCount(): Promise<Result<number>> {
    try {
      const rowCount = await this.db.one(
        sql.get_pending_count,
        [],
        (a: { count: string }) => +a.count,
      )
      this.logger.info(
        { rowCount },
        "getPendingInFlightTransfersCount() returned: {result}.",
      )

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingInFlightTransfersCount() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingDepositInFlightTransfers(): Promise<
    Result<Map<string, InFlightTransfer[]>>
  > {
    try {
      const result = await this.db.each(
        sql.get_pending_deposit,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info(
        { result },
        "getPendingDepositInFlightTransfers() returned: {result}.",
      )

      const transfers = new Map<string, InFlightTransfer[]>()
      for (const transfer of result) {
        if (!transfers.has(transfer.address)) {
          transfers.set(transfer.address, [transfer])
        } else {
          transfers[transfer.address].push(transfer)
        }
      }

      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingDepositInFlightTransfers() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingWithdrawInFlightTransfers(): Promise<
    Result<Map<string, InFlightTransfer[]>>
  > {
    try {
      const result = await this.db.each(
        sql.get_pending_withdraw,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info(
        { result },
        "getPendingWithdrawInFlightTransfers() returned: {result}.",
      )
      const transfers = InFlightTransfersRepository.arrayToMap(result)
      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingWithdrawInFlightTransfers() failed.")
      return { ok: false, error: error }
    }
  }

  public async getAllInFlightTransfers(): Promise<
    Result<Map<string, InFlightTransfer[]>>
  > {
    try {
      const result = await this.db.each(
        sql.get_all,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getAllInFlightTransfers() returned: {result}.")
      const transfers = InFlightTransfersRepository.arrayToMap(result)
      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getAllInFlightTransfers() failed.")
      return { ok: false, error: error }
    }
  }

  public async clearAllInFlightTransfers(): Promise<Result<void>> {
    try {
      await this.db.none(sql.clear)
      return { ok: true, value: undefined }
    } catch (error) {
      this.logger.error({ error }, "Error: clearAllInFlightTransfers() failed.")
      return { ok: false, error: error }
    }
  }

  private static arrayToMap(array: InFlightTransfer[]): Map<string, InFlightTransfer[]> {
    const transfers = new Map<string, InFlightTransfer[]>()
    for (const transfer of array) {
      if (!transfers.has(transfer.address)) {
        transfers.set(transfer.address, [transfer])
      } else {
        transfers[transfer.address].push(transfer)
      }
    }
    return transfers
  }
}
