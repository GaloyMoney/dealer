import { ExternalTransfer } from "src/database/models"
import { db as database } from "src/database"

function getValidExternalTransferApiData() {
  return {
    code: "0",
    data: [
      {
        isDepositNotWithdrawal: true,
        ccy: "BTC",
        amt: "0.20551491",
        destinationAddressTypeId: "4",
        fee: "0",
        to: "bc1q.01.",
        chain: "BTC-Bitcoin",
        transferId: "34048247",
      },
      {
        isDepositNotWithdrawal: false,
        ccy: "BTC",
        amt: "0.0016511",
        destinationAddressTypeId: "4",
        fee: "0",
        to: "bc1q.02.",
        chain: "",
        transferId: "34048248",
      },
    ],
    msg: "",
  }
}

function getValidExternalTransferFromApiData(apiData): ExternalTransfer[] {
  const transfers: ExternalTransfer[] = []

  if (apiData?.data) {
    for (const rawTransfer of apiData?.data) {
      const transfer: ExternalTransfer = {
        isDepositNotWithdrawal: rawTransfer.isDepositNotWithdrawal,
        currency: rawTransfer.ccy,
        quantity: Number(rawTransfer.amt),
        destinationAddressTypeId: Number(rawTransfer.destinationAddressTypeId),
        toAddress: rawTransfer.to,
        fundPassword: "secret",
        fee: Number(rawTransfer.fee),
        chain: rawTransfer.chain,
        transferId: rawTransfer.transferId,
        success: Boolean(rawTransfer.transId),
      }
      transfers.push(transfer)
    }
  }

  return transfers
}

describe("ExternalTransfersRepository", () => {
  describe("insertExternalTransfer", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.externalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiData = getValidExternalTransferApiData()
      const transfers = getValidExternalTransferFromApiData(apiData)
      const aTransfer: ExternalTransfer = transfers[0]
      const result = await database.externalTransfers.insert(aTransfer)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.isDepositNotWithdrawal).toBe(aTransfer.isDepositNotWithdrawal)
      expect(result.value.currency).toBe(aTransfer.currency)
      expect(result.value.quantity).toBe(String(aTransfer.quantity))
      expect(result.value.destinationAddressTypeId).toBe(
        aTransfer.destinationAddressTypeId,
      )
      expect(result.value.toAddress).toBe(aTransfer.toAddress)
      expect(result.value.fee).toBe(String(aTransfer.fee))

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)

      // clear db
      await database.externalTransfers.clearAll()
    })
  })
  describe("clearAllExternalTransfers", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiData = getValidExternalTransferApiData()
      const transfers = getValidExternalTransferFromApiData(apiData)
      for (const transfer of transfers) {
        const insertResult = await database.externalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.externalTransfers.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.externalTransfers.getCount()
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
      const clearResult = await database.externalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiData = getValidExternalTransferApiData()
      const transfers = getValidExternalTransferFromApiData(apiData)
      let expectedCount = 0
      for (const transfer of transfers) {
        const insertResult = await database.externalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.externalTransfers.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("fillExternalTransfers", () => {
    it("should truncate all rows from the database table", async () => {
      // clear db
      const clearResult = await database.externalTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiData = getValidExternalTransferApiData()
      const transfers = getValidExternalTransferFromApiData(apiData)
      for (const transfer of transfers) {
        const insertResult = await database.externalTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }
    })
  })
})
