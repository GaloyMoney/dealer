import pino from "pino"
import { IDatabase, IMain } from "pg-promise"

import { ExchangeNames, FundingRate } from "../models"
import { fundingRatesQueries as sql } from "../sql"
import { Result } from "../../Result"

export class FundingRatesRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: FundingRatesRepository.name })
  }

  public async insert(fundingRate: FundingRate): Promise<Result<FundingRate>> {
    try {
      const result = await this.db.one(sql.insert, {
        fundingRate: fundingRate.fundingRate,
        instrumentId: fundingRate.instrumentId,
        exchangeName: fundingRate.exchangeName,
        timestamp: fundingRate.timestamp,
        fundingTime: fundingRate.fundingTime,
      })
      this.logger.info(
        { fundingRate, result },
        "insertFundingRate({fundingRate}) returned: {result}.",
      )
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error(
        { error, fundingRate },
        "Error: insertFundingRate({fundingRate}) failed.",
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

  public async getFundingYield(
    exchangeName: ExchangeNames,
    numberOfDays: number,
  ): Promise<Result<number>> {
    try {
      const fundingYield = await this.db.one(
        sql.get_funding_yield,
        { exchangeName, numberOfDays },
        (a: { fundingYield: number }) => a && a.fundingYield,
      )
      this.logger.info({ fundingYield }, "getFundingYield() returned: {result}.")

      return { ok: true, value: fundingYield }
    } catch (error) {
      this.logger.error({ error }, "Error: getFundingYield() failed.")
      return { ok: false, error: error }
    }
  }

  public async getAnnualFundingYield(
    exchangeName: ExchangeNames,
    numberOfDays: number,
  ): Promise<Result<number>> {
    try {
      const annualFundingYield = await this.db.one(
        sql.get_funding_yield,
        { exchangeName, numberOfDays },
        (a: { annualFundingYield: number }) => a && a.annualFundingYield,
      )
      this.logger.info(
        { annualFundingYield },
        "getAnnualFundingYield() returned: {result}.",
      )

      return { ok: true, value: annualFundingYield }
    } catch (error) {
      this.logger.error({ error }, "Error: getAnnualFundingYield() failed.")
      return { ok: false, error: error }
    }
  }

  public async getLastFundingTime(): Promise<Result<number | null>> {
    try {
      const fundingTime = await this.db.oneOrNone(
        sql.get_last_funding_time,
        [],
        (a: { fundingTime: number }) => a && a.fundingTime,
      )
      this.logger.info({ fundingTime }, "getLastFundingTime() returned: {fundingTime}.")

      return { ok: true, value: fundingTime }
    } catch (error) {
      this.logger.error({ error }, "Error: getLastFundingTime() failed.")
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
}
