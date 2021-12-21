import pino from "pino"
import { IDatabase, IMain } from "pg-promise"
import { Order } from "../models"
import { ordersQueries as sql } from "../sql"
import { Result } from "../../Result"

export enum OrderSide {
  Buy = "buy",
  Sell = "sell",
}

export class OrdersRepository {
  private logger: pino.Logger

  constructor(logger: pino.Logger, private db: IDatabase<unknown>, private pgp: IMain) {
    this.logger = logger.child({ class: OrdersRepository.name })
  }

  public async insert(order: Order): Promise<Result<Order>> {
    try {
      const result = await this.db.one(
        sql.insert,
        {
          instrumentId: order.instrumentId,
          orderType: order.orderType,
          side: order.side,
          quantity: order.quantity,
          tradeMode: order.tradeMode,
          positionSide: order.positionSide,
          statusCode: order.statusCode,
          statusMessage: order.statusMessage,
          orderId: order.orderId,
          clientOrderId: order.clientOrderId,
          success: order.success,
        },
        OrdersRepository.callBack,
      )
      this.logger.info({ order, result }, "insertOrder({order}) returned: {result}.")
      return { ok: true, value: result }
    } catch (error) {
      this.logger.error({ error, order }, "Error: insertOrder({order}) failed.")
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

  public async getSideCount(side: OrderSide): Promise<Result<number>> {
    try {
      const rowCount = await this.db.one(
        sql.get_side_count,
        { side },
        (a: { count: string }) => +a.count,
      )
      this.logger.info({ rowCount }, "getSideCount() returned: {result}.")

      return { ok: true, value: rowCount }
    } catch (error) {
      this.logger.error({ error }, "Error: getSideCount() failed.")
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

  private static callBack(order: Order): Order {
    // order.orderType = `${order.orderType}`
    // order.orderType = ""
    return order
  }
}
