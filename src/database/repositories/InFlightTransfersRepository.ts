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

  public async insertInFlightTransfer(
    transfer: InFlightTransfer,
  ): Promise<Result<InFlightTransfer>> {
    try {
      const result = await this.db.one(sql.insert, {
        isDepositOnExchange: transfer.isDepositOnExchange,
        address: transfer.address,
        transferSizeInSats: transfer.transferSizeInSats,
        memo: transfer.memo,
        isCompleted: transfer.isCompleted,
      })
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
      const rowCount = await this.db.result(
        sql.complete,
        { address },
        (r: IResult) => r.rowCount,
      )
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
  ): Promise<Result<InFlightTransfer>> {
    try {
      const result = await this.db.oneOrNone(sql.get_this, { address })
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

  public async getPendingDepositInFlightTransfers(): Promise<
    Result<Map<string, InFlightTransfer[]>>
  > {
    try {
      const result = await this.db.manyOrNone(sql.get_pending_deposit)
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
      const result = await this.db.manyOrNone(sql.get_pending_withdraw)
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
      const result = await this.db.manyOrNone(sql.get_all)
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
