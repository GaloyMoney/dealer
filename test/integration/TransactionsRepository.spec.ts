import { Transaction } from "src/database/models"
import { db as database } from "src/database"

function getValidTransactionApiResponse() {
  return {
    code: "0",
    data: [
      {
        bal: "0.1137230400017355",
        balChg: "-0.0000104355564226",
        billId: "392949279010222087",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000104355564226",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639958408760",
        type: "8",
      },
      {
        bal: "0.1137334755581581",
        balChg: "0.0000462923817015",
        billId: "392828512276738053",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "0.0000462923817015",
        posBal: "0",
        posBalChg: "0",
        subType: "174",
        sz: "100",
        to: "",
        ts: "1639929615727",
        type: "8",
      },
      {
        bal: "0.1136871831764566",
        balChg: "-0.0000162966610336",
        billId: "392707688081289217",
        ccy: "BTC",
        execType: "",
        fee: "0",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "",
        pnl: "-0.0000162966610336",
        posBal: "0",
        posBalChg: "0",
        subType: "173",
        sz: "100",
        to: "",
        ts: "1639900808994",
        type: "8",
      },

      {
        bal: "0.1138239511847323",
        balChg: "-0.0926999600000000",
        billId: "389554404495618048",
        ccy: "BTC",
        execType: "",
        fee: "",
        from: "18",
        instId: "",
        instType: "",
        mgnMode: "",
        notes: "To Funding Account",
        ordId: "",
        pnl: "",
        posBal: "",
        posBalChg: "",
        subType: "12",
        sz: "-0.09269996",
        to: "6",
        ts: "1639149007602",
        type: "1",
      },
      {
        bal: "0.2065239111847323",
        balChg: "0.0003987476456073",
        billId: "389554390578917376",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000351963958891",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0004339440414964",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "34",
        to: "",
        ts: "1639149004284",
        type: "2",
      },
      {
        bal: "0.206125163539125",
        balChg: "0.0001876459508741",
        billId: "389554390574723090",
        ccy: "BTC",
        execType: "T",
        fee: "-0.0000165630098301",
        from: "",
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        mgnMode: "cross",
        notes: "",
        ordId: "389554390545362951",
        pnl: "0.0002042089607042",
        posBal: "0",
        posBalChg: "0",
        subType: "1",
        sz: "16",
        to: "",
        ts: "1639149004283",
        type: "2",
      },
    ],
    msg: "",
  }
}

function getValidTransactionFromApiResponse(apiResponse): Transaction[] {
  const transactions: Transaction[] = []

  if (apiResponse?.data) {
    for (const rawTransaction of apiResponse?.data) {
      const transaction: Transaction = {
        balance: Number(rawTransaction.bal),
        balanceChange: Number(rawTransaction.balChg),
        billId: rawTransaction.billId,
        currency: rawTransaction.ccy,
        executionType: rawTransaction.execType,
        fee: Number(rawTransaction.fee),
        fromAccountId: Number(rawTransaction.from),
        instrumentId: rawTransaction.instId,
        instrumentType: rawTransaction.instType,
        marginMode: rawTransaction.mgnMode,
        notes: rawTransaction.notes,
        orderId: rawTransaction.ordId,
        pnl: Number(rawTransaction.pnl),
        positionBalance: Number(rawTransaction.posBal),
        positionBalanceChange: Number(rawTransaction.posBalChg),
        billSubtypeId: Number(rawTransaction.subType),
        quantity: Number(rawTransaction.sz),
        toAccountId: Number(rawTransaction.to),
        timestamp: rawTransaction.ts,
        billTypeId: Number(rawTransaction.type),
      }
      transactions.push(transaction)
    }
  }

  return transactions
}

describe("TransactionsRepository", () => {
  describe("insertTransaction", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      const aTransaction: Transaction = transactions[0]
      const result = await database.transactions.insert(aTransaction)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.balance).toBe(String(aTransaction.balance))
      expect(result.value.balanceChange).toBe(String(aTransaction.balanceChange))
      expect(result.value.billId).toBe(aTransaction.billId)
      expect(result.value.currency).toBe(aTransaction.currency)
      expect(result.value.billSubtypeId).toBe(aTransaction.billSubtypeId)
      expect(result.value.billTypeId).toBe(aTransaction.billTypeId)

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)

      // clear db
      await database.transactions.clearAll()
    })
  })
  describe("clearAllTransactions", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.transactions.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.transactions.getCount()
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
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      let expectedCount = 0
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.transactions.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("getTypeCount", () => {
    it("should count all rows per type from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      const expectedCounts = {}
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        expectedCounts[transaction.billTypeId] =
          expectedCounts[transaction.billTypeId] + 1 || 1
      }

      for (const transactionType of Object.keys(expectedCounts)) {
        // test functionality
        const countResult = await database.transactions.getTypeCount(
          Number(transactionType),
        )
        expect(countResult).toBeTruthy()
        expect(countResult.ok).toBeTruthy()
        if (!countResult.ok) {
          return
        }

        // validate
        expect(countResult.value).toBe(expectedCounts[transactionType])
      }
    })
  })
  describe("getLastBillId", () => {
    it("should get null bill_id when no transactions in the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // test functionality
      const countResult = await database.transactions.getLastBillId()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      const billId = countResult.value
      expect(billId).toBeFalsy()
    })
    it("should get most recent bill_id from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      let expectedBillId = ""
      let maxTimestamp = 0
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        const ts = Number(transaction.timestamp)
        if (ts > maxTimestamp) {
          maxTimestamp = ts
          expectedBillId = `${transaction.billId}`
        }
      }

      // test functionality
      const countResult = await database.transactions.getLastBillId()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      const billId = countResult.value
      expect(billId).toBeTruthy()
      expect(billId).toBe(expectedBillId)
    })
  })
  describe("fillTransactions", () => {
    it("should truncate all rows from the database table", async () => {
      // clear db
      const clearResult = await database.transactions.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiResponse = getValidTransactionApiResponse()
      const transactions = getValidTransactionFromApiResponse(apiResponse)
      for (const transaction of transactions) {
        const insertResult = await database.transactions.insert(transaction)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }
    })
  })
})
