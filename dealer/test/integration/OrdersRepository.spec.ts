import { Order } from "src/database/models"
import { db as database } from "src/database"
import { OrderSide } from "src/database/repositories/OrdersRepository"

function getValidOrderApiData() {
  return {
    code: "0",
    data: [
      {
        accFillSz: "100",
        avgPx: "48300.4",
        cTime: "1639149004276",
        category: "normal",
        ccy: "",
        clOrdId: "e847386590ce4dBCfbea43d8944c9761",
        fee: "-0.0001035188114384",
        feeCcy: "BTC",
        fillPx: "48300.4",
        fillSz: "34",
        fillTime: "1639149004280",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        lever: "3.0",
        ordId: "389554390545362951",
        ordType: "market",
        pnl: "0.0012763060044012",
        posSide: "net",
        px: "",
        rebate: "0",
        rebateCcy: "BTC",
        side: "buy",
        slOrdPx: "",
        slTriggerPx: "",
        slTriggerPxType: "",
        source: "",
        state: "filled",
        sz: "100",
        tag: "",
        tdMode: "cross",
        tgtCcy: "",
        tpOrdPx: "",
        tpTriggerPx: "",
        tpTriggerPxType: "",
        tradeId: "157927666",
        uTime: "1639149004325",
        sCode: "0",
        sMsg: "",
      },
      {
        accFillSz: "99",
        avgPx: "48600",
        cTime: "1639140626273",
        category: "normal",
        ccy: "",
        clOrdId: "",
        fee: "-0.0000407407407407",
        feeCcy: "BTC",
        fillPx: "48600",
        fillSz: "99",
        fillTime: "1639147637411",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        lever: "3.0",
        ordId: "389519250653868032",
        ordType: "limit",
        pnl: "0",
        posSide: "net",
        px: "48600",
        rebate: "0",
        rebateCcy: "BTC",
        side: "buy",
        slOrdPx: "",
        slTriggerPx: "",
        slTriggerPxType: "",
        source: "",
        state: "filled",
        sz: "99",
        tag: "",
        tdMode: "cross",
        tgtCcy: "",
        tpOrdPx: "",
        tpTriggerPx: "",
        tpTriggerPxType: "",
        tradeId: "157911322",
        uTime: "1639147637452",
        sCode: "0",
        sMsg: "",
      },
      {
        accFillSz: "299",
        avgPx: "48600",
        cTime: "1639132589664",
        category: "normal",
        ccy: "",
        clOrdId: "",
        fee: "-0.0001230452674898",
        feeCcy: "BTC",
        fillPx: "48600",
        fillSz: "123",
        fillTime: "1639134381230",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        lever: "3.0",
        ordId: "389485542672592896",
        ordType: "limit",
        pnl: "0",
        posSide: "net",
        px: "48600",
        rebate: "0",
        rebateCcy: "BTC",
        side: "sell",
        slOrdPx: "",
        slTriggerPx: "",
        slTriggerPxType: "",
        source: "",
        state: "filled",
        sz: "299",
        tag: "",
        tdMode: "cross",
        tgtCcy: "",
        tpOrdPx: "",
        tpTriggerPx: "",
        tpTriggerPxType: "",
        tradeId: "157867095",
        uTime: "1639134381298",
        sCode: "0",
        sMsg: "",
      },
    ],
    msg: "",
  }
}

function getValidOrderFromApiData(apiData): Order[] {
  const orders: Order[] = []

  if (apiData?.data) {
    for (const rawOrder of apiData?.data) {
      const order: Order = {
        instrumentId: rawOrder.instId,
        orderType: rawOrder.ordType,
        side: rawOrder.side,
        quantity: Number(rawOrder.sz),
        tradeMode: rawOrder.tdMode,
        positionSide: rawOrder.posSide,
        statusCode: rawOrder.sCode,
        statusMessage: rawOrder.sMsg,
        orderId: rawOrder.ordId,
        clientOrderId: rawOrder.clOrdId,
        success: rawOrder.sCode === "0",
      }
      orders.push(order)
    }
  }

  return orders
}

describe("OrdersRepository", () => {
  describe("insertOrder", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.orders.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiData = getValidOrderApiData()
      const orders = getValidOrderFromApiData(apiData)
      const anOrder: Order = orders[0]
      const result = await database.orders.insert(anOrder)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.instrumentId).toBe(anOrder.instrumentId)
      expect(result.value.side).toBe(anOrder.side)
      expect(result.value.quantity).toBe(String(anOrder.quantity))
      expect(result.value.tradeMode).toBe(anOrder.tradeMode)
      expect(result.value.positionSide).toBe(anOrder.positionSide)

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)

      // clear db
      await database.orders.clearAll()
    })
  })
  describe("clearAllOrders", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiData = getValidOrderApiData()
      const orders = getValidOrderFromApiData(apiData)
      for (const order of orders) {
        const insertResult = await database.orders.insert(order)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.orders.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.orders.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }
      expect(countResult.value).toBe(0)
    })
  })
  describe("getCount", () => {
    it("should count all rows from the database table", async () => {
      // clear db
      const clearResult = await database.orders.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiData = getValidOrderApiData()
      const orders = getValidOrderFromApiData(apiData)
      let expectedCount = 0
      for (const order of orders) {
        const insertResult = await database.orders.insert(order)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.orders.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("getSideCount", () => {
    it("should count all rows per side from the database table", async () => {
      // clear db
      const clearResult = await database.orders.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiData = getValidOrderApiData()
      const orders = getValidOrderFromApiData(apiData)
      const expectedCounts = {}
      for (const order of orders) {
        const insertResult = await database.orders.insert(order)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        expectedCounts[order.side] = expectedCounts[order.side] + 1 || 1
      }

      for (const orderSide of Object.keys(expectedCounts)) {
        // test functionality
        const countResult = await database.orders.getSideCount(orderSide as OrderSide)
        expect(countResult).toBeTruthy()
        expect(countResult.ok).toBeTruthy()
        if (!countResult.ok) {
          return
        }

        // validate
        expect(countResult.value).toBe(expectedCounts[orderSide])
      }
    })
  })
  describe("fillOrders", () => {
    it("should truncate all rows from the database table", async () => {
      // clear db
      const clearResult = await database.orders.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiData = getValidOrderApiData()
      const orders = getValidOrderFromApiData(apiData)
      for (const order of orders) {
        const insertResult = await database.orders.insert(order)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }
    })
  })
})
