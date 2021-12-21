import { InternalTransfer } from "src/database/models"
import { db as database } from "src/database"

function getValidInternalTransferApiData() {
  return {
    code: "0",
    data: [
      {
        ccy: "BTC",
        amt: "-0.09269996",
        from: "18",
        to: "6",
        instId: "",
        transId: "495618048",
      },
      {
        ccy: "BTC",
        amt: "0.20551491",
        from: "6",
        to: "18",
        instId: "",
        transId: "479442434",
      },
    ],
    msg: "",
  }
}

function getValidInternalTransferFromApiData(apiData): InternalTransfer[] {
  const transfers: InternalTransfer[] = []

  if (apiData?.data) {
    for (const rawTransfer of apiData?.data) {
      const transfer: InternalTransfer = {
        currency: rawTransfer.ccy,
        quantity: Number(rawTransfer.amt),
        fromAccountId: Number(rawTransfer.from),
        toAccountId: Number(rawTransfer.to),
        instrumentId: rawTransfer.instId,
        transferId: rawTransfer.transId,
        success: Boolean(rawTransfer.transId),
      }

      if (!transfer.instrumentId) {
        delete transfer.instrumentId
      }
      if (!transfer.transferId) {
        delete transfer.transferId
      }

      transfers.push(transfer)
    }
  }

  return transfers
}

describe("InternalTransfersRepository", () => {
  describe("insertInternalTransfer", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.internalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiData = getValidInternalTransferApiData()
      const transfers = getValidInternalTransferFromApiData(apiData)
      const aTransfer: InternalTransfer = transfers[0]
      const result = await database.internalTransfers.insert(aTransfer)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.currency).toBe(aTransfer.currency)
      expect(result.value.quantity).toBe(String(aTransfer.quantity))
      expect(result.value.fromAccountId).toBe(Number(aTransfer.fromAccountId))
      expect(result.value.toAccountId).toBe(Number(aTransfer.toAccountId))

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)

      // clear db
      await database.internalTransfers.clearAll()
    })
  })
  describe("clearAllInternalTransfers", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiData = getValidInternalTransferApiData()
      const transfers = getValidInternalTransferFromApiData(apiData)
      for (const transfer of transfers) {
        const insertResult = await database.internalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.internalTransfers.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.internalTransfers.getCount()
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
      const clearResult = await database.internalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiData = getValidInternalTransferApiData()
      const transfers = getValidInternalTransferFromApiData(apiData)
      let expectedCount = 0
      for (const transfer of transfers) {
        const insertResult = await database.internalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.internalTransfers.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("fillInternalTransfers", () => {
    it("should truncate all rows from the database table", async () => {
      // clear db
      const clearResult = await database.internalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiData = getValidInternalTransferApiData()
      const transfers = getValidInternalTransferFromApiData(apiData)
      for (const transfer of transfers) {
        const insertResult = await database.internalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }
    })
  })
})
