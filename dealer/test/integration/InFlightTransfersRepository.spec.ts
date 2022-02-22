import { InFlightTransfer } from "src/database/models"
import { db as database } from "src/database"

describe("InFlightTransfersRepository", () => {
  describe("insertInFlightTransfer", () => {
    it("should create a row in the database table", async () => {
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: false,
        address: "bc1q.01.",
        transferSizeInSats: 123401,
        memo: "tx01",
        isCompleted: false,
      }
      const result = await database.inFlightTransfers.insert(aTransfer)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.isDepositOnExchange).toBe(aTransfer.isDepositOnExchange)
      expect(result.value.address).toBe(aTransfer.address)
      expect(result.value.transferSizeInSats).toBe(aTransfer.transferSizeInSats)
      expect(result.value.memo).toBe(aTransfer.memo)
      expect(result.value.isCompleted).toBe(aTransfer.isCompleted)
      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBe(result.value.updatedTimestamp)
    })
    it("should create a deposit row in the database table", async () => {
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: true,
        address: "bc1q.02.",
        transferSizeInSats: 123402,
        memo: "tx02",
        isCompleted: false,
      }
      const result = await database.inFlightTransfers.insert(aTransfer)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.isDepositOnExchange).toBe(aTransfer.isDepositOnExchange)
    })
    it("should create a completed row in the database table", async () => {
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: true,
        address: "bc1q.03.",
        transferSizeInSats: 123403,
        memo: "tx03",
        isCompleted: true,
      }
      const result = await database.inFlightTransfers.insert(aTransfer)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.isCompleted).toBe(aTransfer.isCompleted)
    })
  })
  describe("completedInFlightTransfer", () => {
    it("should update one row in the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: false,
        address: "bc1q.01.",
        transferSizeInSats: 123401,
        memo: "tx01",
        isCompleted: false,
      }
      const insertResult = await database.inFlightTransfers.insert(aTransfer)
      expect(insertResult).toBeTruthy()
      expect(insertResult.ok).toBeTruthy()

      // test functionality
      const result = await database.inFlightTransfers.completed(aTransfer.address)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBe(1)
    })
    it("should update zero row in the database table and error out", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert pre-completed dummy data
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: false,
        address: "bc1q.01.",
        transferSizeInSats: 123401,
        memo: "tx01",
        isCompleted: true,
      }
      const insertResult = await database.inFlightTransfers.insert(aTransfer)
      expect(insertResult).toBeTruthy()
      expect(insertResult.ok).toBeTruthy()

      // test functionality
      const result = await database.inFlightTransfers.completed(aTransfer.address)
      expect(result).toBeTruthy()
      expect(result.ok).toBeFalsy()
    })
    it("should update more than one row in the database table and error out", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert pre-completed dummy data
      const aTransfer: InFlightTransfer = {
        isDepositOnExchange: false,
        address: "bc1q.01.",
        transferSizeInSats: 123401,
        memo: "tx01",
        isCompleted: false,
      }
      let insertResult = await database.inFlightTransfers.insert(aTransfer)
      expect(insertResult).toBeTruthy()
      expect(insertResult.ok).toBeTruthy()
      // a second time
      aTransfer.transferSizeInSats = 123402
      aTransfer.memo = "tx02"
      insertResult = await database.inFlightTransfers.insert(aTransfer)
      expect(insertResult).toBeTruthy()
      expect(insertResult.ok).toBeTruthy()

      // test functionality
      const result = await database.inFlightTransfers.completed(aTransfer.address)
      expect(result).toBeTruthy()
      expect(result.ok).toBeFalsy()
    })
  })
  describe("getAllInFlightTransfers", () => {
    it("should retrieve zero rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // test functionality
      const result = await database.inFlightTransfers.getAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBe(0)
    })
    it("should retrieve one rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBe(1)

      const localTx = transfers[0]
      const dcTxs = result.value.get(localTx.address)

      // validate existing data
      expect(dcTxs).toBeTruthy()
      if (!dcTxs) {
        return
      }
      const dcTx = dcTxs[0]
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)
    })
    it("should retrieve more than one rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: false,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBeGreaterThan(1)
    })
  })
  describe("clearAllInFlightTransfers", () => {
    it("should truncate all rows from the database table", async () => {
      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: false,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const getResult = await database.inFlightTransfers.getAll()
      expect(getResult).toBeTruthy()
      expect(getResult.ok).toBeTruthy()
      if (!getResult.ok) {
        return
      }
      expect(result.value).toBeFalsy()
    })
  })
  describe("getThisInFlightTransfer", () => {
    it("should retrieve one specific row from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: false,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getThisOne(transfers[0].address)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()

      const localTx = transfers[0]
      const dcTx = result.value[0]

      // validate existing data
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)
    })
  })
  describe("getPendingInFlightTransfers", () => {
    it("should retrieve only pending  rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: true,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.03.",
          transferSizeInSats: 123403,
          memo: "tx03",
          isCompleted: false,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.04.",
          transferSizeInSats: 123404,
          memo: "tx04",
          isCompleted: true,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getPending()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBe(2)

      let localTx = transfers[2]
      let dcTxs = result.value.get(localTx.address)

      // validate existing data
      expect(dcTxs).toBeTruthy()
      if (!dcTxs) {
        return
      }
      let dcTx = dcTxs[0]
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)

      localTx = transfers[0]
      dcTxs = result.value.get(localTx.address)

      // validate existing data
      expect(dcTxs).toBeTruthy()
      if (!dcTxs) {
        return
      }
      dcTx = dcTxs[0]
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)
    })
  })
  describe("getPendingDepositInFlightTransfers", () => {
    it("should retrieve only pending deposit rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: true,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.03.",
          transferSizeInSats: 123403,
          memo: "tx03",
          isCompleted: false,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.04.",
          transferSizeInSats: 123404,
          memo: "tx04",
          isCompleted: true,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getPendingDeposit()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBe(1)

      const localTx = transfers[2]
      const dcTxs = result.value.get(localTx.address)

      // validate existing data
      expect(dcTxs).toBeTruthy()
      if (!dcTxs) {
        return
      }
      const dcTx = dcTxs[0]
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)
    })
  })
  describe("getPendingWithdrawInFlightTransfers", () => {
    it("should retrieve only pending withdraw rows from the database table", async () => {
      // clear db
      const clearResult = await database.inFlightTransfers.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert dummy data
      const transfers: InFlightTransfer[] = [
        {
          isDepositOnExchange: false,
          address: "bc1q.01.",
          transferSizeInSats: 123401,
          memo: "tx01",
          isCompleted: false,
        },
        {
          isDepositOnExchange: false,
          address: "bc1q.02.",
          transferSizeInSats: 123402,
          memo: "tx02",
          isCompleted: true,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.03.",
          transferSizeInSats: 123403,
          memo: "tx03",
          isCompleted: false,
        },
        {
          isDepositOnExchange: true,
          address: "bc1q.04.",
          transferSizeInSats: 123404,
          memo: "tx04",
          isCompleted: true,
        },
      ]
      for (const transfer of transfers) {
        const insertResult = await database.inFlightTransfers.insert(transfer)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.inFlightTransfers.getPendingWithdraw()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }
      expect(result.value).toBeTruthy()
      expect(result.value.size).toBe(1)

      const localTx = transfers[0]
      const dcTxs = result.value.get(localTx.address)

      // validate existing data
      expect(dcTxs).toBeTruthy()
      if (!dcTxs) {
        return
      }
      const dcTx = dcTxs[0]
      expect(dcTx.isDepositOnExchange).toBe(localTx.isDepositOnExchange)
      expect(dcTx.address).toBe(localTx.address)
      expect(dcTx.transferSizeInSats).toBe(localTx.transferSizeInSats)
      expect(dcTx.memo).toBe(localTx.memo)
      expect(dcTx.isCompleted).toBe(localTx.isCompleted)
      // validate created data
      expect(dcTx.id).toBeTruthy()
      expect(dcTx.id).toBeGreaterThanOrEqual(0)
      expect(dcTx.createdTimestamp).toBeTruthy()
      expect(dcTx.updatedTimestamp).toBeTruthy()
      expect(dcTx.createdTimestamp).toBe(dcTx.updatedTimestamp)
    })
  })
})
