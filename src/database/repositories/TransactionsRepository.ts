import pino from "pino"
import { IDatabase, IMain } from "pg-promise"
import { Transaction } from "../models"
import { transactionsQueries as sql } from "../sql"
import { Result } from "../../Result"

export enum TransactionType {
  Transfer = 1,
  Trade = 2,
  Delivery = 3,
  Auto = 4,
  Liquidation = 5,
  Margin = 6,
  Interest = 7,
  Funding = 8,
  ADL = 9,
  Clawback = 10,
  System = 11,
  Strategy = 12,
  ddh = 13,
}

export class TransactionsRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: TransactionsRepository.name })
  }

  public async insert(transaction: Transaction): Promise<Result<Transaction>> {
    try {
      // Clear nullables
      if (!transaction.executionType) {
        delete transaction.executionType
      }
      if (!transaction.instrumentType) {
        delete transaction.instrumentType
      }
      if (!transaction.marginMode) {
        delete transaction.marginMode
      }

      const result = await this.db.one(
        sql.insert,
        {
          balance: transaction.balance,
          balanceChange: transaction.balanceChange,
          billId: transaction.billId,
          currency: transaction.currency,
          executionType: transaction.executionType,
          fee: transaction.fee,
          fromAccountId: transaction.fromAccountId,
          instrumentId: transaction.instrumentId,
          instrumentType: transaction.instrumentType,
          marginMode: transaction.marginMode,
          notes: transaction.notes,
          orderId: transaction.orderId,
          pnl: transaction.pnl,
          positionBalance: transaction.positionBalance,
          positionBalanceChange: transaction.positionBalanceChange,
          billSubtypeId: transaction.billSubtypeId,
          quantity: transaction.quantity,
          toAccountId: transaction.toAccountId,
          timestamp: transaction.timestamp,
          billTypeId: transaction.billTypeId,
        },
        TransactionsRepository.callBack,
      )
      this.logger.info(
        { transaction, result },
        "insertTransaction({transaction}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, transaction },
        "Error: insertTransaction({transaction}) failed.",
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

  public async getTypeCount(transactionType: TransactionType): Promise<Result<number>> {
    try {
      const rowCount = await this.db.one(
        sql.get_type_count,
        { billTypeId: transactionType },
        (a: { count: string }) => +a.count,
      )
      this.logger.info({ rowCount }, "getTypeCount() returned: {result}.")

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getTypeCount() failed.")
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

  private static callBack(transaction: Transaction): Transaction {
    return transaction
  }
}
