import pino from "pino"
import { IDatabase, IMain } from "pg-promise"
import { InternalTransfer, InternalTransfersMetrics } from "../models"
import { internalTransfersQueries as sql } from "../sql"
import { Result } from "../../Result"

export class InternalTransfersRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: InternalTransfersRepository.name })
  }

  public async insert(transfer: InternalTransfer): Promise<Result<InternalTransfer>> {
    try {
      // Clear nullables
      if (!transfer.instrumentId) {
        delete transfer.instrumentId
      }
      if (!transfer.transferId) {
        delete transfer.transferId
      }

      const result = await this.db.one(
        sql.insert,
        {
          currency: transfer.currency,
          quantity: transfer.quantity,
          fromAccountId: transfer.fromAccountId,
          toAccountId: transfer.toAccountId,
          instrumentId: transfer.instrumentId,
          transferId: transfer.transferId,
          success: transfer.success,
        },
        InternalTransfersRepository.callBack,
      )
      this.logger.info(
        { transfer, result },
        "insertInternalTransfer({transfer}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, transfer },
        "Error: insertInternalTransfer({transfer}) failed.",
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

  private static InternalTransfersMetricsCallback(
    metrics: InternalTransfersMetrics,
  ): InternalTransfersMetrics {
    metrics.totalInternalTransfersCount = Number(metrics.totalInternalTransfersCount)
    metrics.tradingToFundingSuccessCount = Number(metrics.tradingToFundingSuccessCount)
    metrics.tradingToFundingFailCount = Number(metrics.tradingToFundingFailCount)
    metrics.fundingToTradingSuccessCount = Number(metrics.fundingToTradingSuccessCount)
    metrics.fundingToTradingFailCount = Number(metrics.fundingToTradingFailCount)
    return metrics
  }

  public async getMetrics(): Promise<Result<InternalTransfersMetrics>> {
    try {
      const rowCount = await this.db.one(
        sql.get_metrics,
        [],
        InternalTransfersRepository.InternalTransfersMetricsCallback,
      )
      this.logger.info({ rowCount }, "getMetrics() returned: {result}.")

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getMetrics() failed.")
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

  private static callBack(transfer: InternalTransfer): InternalTransfer {
    return transfer
  }
}
