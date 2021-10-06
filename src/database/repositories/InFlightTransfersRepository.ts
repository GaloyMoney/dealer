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

  public async insert(transfer: InFlightTransfer): Promise<Result<InFlightTransfer>> {
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

  public async completed(address: string): Promise<Result<number>> {
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

  public async getThisOne(address: string): Promise<Result<InFlightTransfer[]>> {
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

  public async getPending(): Promise<Result<Map<string, InFlightTransfer[]>>> {
    try {
      const result = await this.db.each(
        sql.get_pending,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getPending() returned: {result}.")

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
      this.logger.error({ error }, "Error: getPending() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingCount(): Promise<Result<number>> {
    try {
      const rowCount = await this.db.one(
        sql.get_pending_count,
        [],
        (a: { count: string }) => +a.count,
      )
      this.logger.info({ rowCount }, "getPendingCount() returned: {result}.")

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingCount() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingDeposit(): Promise<Result<Map<string, InFlightTransfer[]>>> {
    try {
      const result = await this.db.each(
        sql.get_pending_deposit,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getPendingDeposit() returned: {result}.")

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
      this.logger.error({ error }, "Error: getPendingDeposit() failed.")
      return { ok: false, error: error }
    }
  }

  public async getPendingWithdraw(): Promise<Result<Map<string, InFlightTransfer[]>>> {
    try {
      const result = await this.db.each(
        sql.get_pending_withdraw,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getPendingWithdraw() returned: {result}.")
      const transfers = InFlightTransfersRepository.arrayToMap(result)
      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getPendingWithdraw() failed.")
      return { ok: false, error: error }
    }
  }

  public async getAll(): Promise<Result<Map<string, InFlightTransfer[]>>> {
    try {
      const result = await this.db.each(
        sql.get_all,
        [],
        InFlightTransfersRepository.transferSizeInSatsAsInteger,
      )
      this.logger.info({ result }, "getAll() returned: {result}.")
      const transfers = InFlightTransfersRepository.arrayToMap(result)
      return { ok: true, value: transfers }
    } catch (error) {
      this.logger.error({ error }, "Error: getAll() failed.")
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

  private static transferSizeInSatsAsInteger(
    transfer: InFlightTransfer,
  ): InFlightTransfer {
    transfer.transferSizeInSats = parseInt(`${transfer.transferSizeInSats}`)
    return transfer
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
