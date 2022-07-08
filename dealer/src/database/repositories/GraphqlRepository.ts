import pino from "pino"
import { IDatabase, IMain } from "pg-promise"

import { Wallet, LastOnChainAddress, OnChainPay } from "../models"
import { graphql as sql } from "../sql"
import { Result } from "../../Result"

export class GraphqlRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: GraphqlRepository.name })
  }

  public async getWallet(): Promise<Result<Wallet>> {
    try {
      const result = await this.db.one(sql.get_wallet)
      this.logger.info({ result }, "getWallet() returned: {result}.")

      return { ok: true, value: result }
    } catch (error) {
      this.logger.error({ error }, "Error: getWallet() failed.")
      return { ok: false, error: error }
    }
  }

  public async getLastOnChainAddress(): Promise<Result<LastOnChainAddress>> {
    try {
      const result = await this.db.one(sql.get_last_on_chain_address)
      this.logger.info({ result }, "getLastOnChainAddress() returned: {result}.")

      return { ok: true, value: result }
    } catch (error) {
      this.logger.error({ error }, "Error: getLastOnChainAddress() failed.")
      return { ok: false, error: error }
    }
  }

  public async getOnChainPay(): Promise<Result<OnChainPay>> {
    try {
      const result = await this.db.one(sql.get_on_chain_pay)
      this.logger.info({ result }, "getOnChainPay() returned: {result}.")

      return { ok: true, value: result }
    } catch (error) {
      this.logger.error({ error }, "Error: getOnChainPay() failed.")
      return { ok: false, error: error }
    }
  }

  public async setOnChainPay(jsonData: string): Promise<Result<OnChainPay>> {
    try {
      const result = await this.db.one(sql.set_on_chain_pay, { jsonData })
      this.logger.info({ jsonData, result }, "setOnChainPay() returned: {result}.")

      return { ok: true, value: result }
    } catch (error) {
      this.logger.error({ jsonData, error }, "Error: setOnChainPay() failed.")
      return { ok: false, error: error }
    }
  }
}
