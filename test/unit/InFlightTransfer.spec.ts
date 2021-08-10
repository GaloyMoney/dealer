import fs from "fs"
import { baseLogger } from "src/logger"
import {
  InFlightTransfer,
  InFlightTransferDb,
  InFlightTransferDbError,
  InFlightTransferDirection,
  InFlightTransferStatus,
} from "src/InFlightTransferDb"

afterAll(async () => {
  try {
    const fileName = InFlightTransferDb.databaseFileName
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }
  } catch (error) {}
})

describe("InFlightTransferDb", () => {
  describe.only("constructor", () => {
    it("should create a database file", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      new InFlightTransferDb(logger)
      const fileName = InFlightTransferDb.databaseFileName
      const doesFileExist = fs.existsSync(fileName)
      expect(doesFileExist).toBeTruthy()
    })
  })

  describe.only("insertInFlightTransfers", () => {
    it("should insert a record with success", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      const result = database.insertInFlightTransfers(record0)
      expect(result.ok).toBeTruthy()
    })
    it("should insert only one record", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      const result = database.insertInFlightTransfers(record0)
      expect(result.ok).toBeTruthy()
      const records = database.getAllInFlightTransfers()
      expect(records.ok).toBeTruthy()
      if (records.ok) {
        expect(records.value.size).toBe(1)
      }
    })
    it("should insert and return the same equal record", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      const result = database.insertInFlightTransfers(record0)
      expect(result.ok).toBeTruthy()
      const records = database.getAllInFlightTransfers()
      expect(records.ok).toBeTruthy()
      if (records.ok) {
        expect(records.value.size).toBe(1)
        const myRecord = records.value.get(record0.address)
        expect(myRecord).toEqual(record0)
      }
    })
    it("should return error when insert existing record", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      let result = database.insertInFlightTransfers(record0)
      expect(result.ok).toBeTruthy()

      result = database.insertInFlightTransfers(record0)
      expect(result.ok).toBeFalsy()
      if (!result.ok) {
        expect(result.error.message).toBe(InFlightTransferDbError.ALREADY_EXIST)
      }
    })
  })

  describe.only("completedInFlightTransfers", () => {
    it("should mark the record completed", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const result = database.completedInFlightTransfers(record0.address)
      expect(result.ok).toBeTruthy()
      const records = database.getAllInFlightTransfers()
      expect(records.ok).toBeTruthy()
      if (records.ok) {
        expect(records.value.size).toBe(1)
        const myCompletedRecord = records.value.get(record0.address)
        expect(myCompletedRecord?.status).toBe(InFlightTransferStatus.COMPLETED)
      }
    })
    it("should update the updated timestamp of the record", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const result = database.completedInFlightTransfers(record0.address)
      expect(result.ok).toBeTruthy()
      const records = database.getAllInFlightTransfers()
      expect(records.ok).toBeTruthy()
      if (records.ok) {
        expect(records.value.size).toBe(1)
        const myCompletedRecord = records.value.get(record0.address)
        expect(myCompletedRecord?.updatedTimestamp).not.toBe(record0.updatedTimestamp)
      }
    })
    it("should return error when record does not exist", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const result = database.completedInFlightTransfers(`wrong_${record0.address}`)
      expect(result.ok).toBeFalsy()
      if (!result.ok) {
        expect(result.error.message).toBe(InFlightTransferDbError.DOES_NOT_EXIST)
      }
    })
  })

  describe.only("getThisInFlightTransfer", () => {
    it("should return the expected record", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const result = database.getThisInFlightTransfer(record0.address)
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value).toEqual(record0)
      }
    })
    it("should return error when record does not exist", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const result = database.getThisInFlightTransfer(`wrong_${record0.address}`)
      expect(result.ok).toBeFalsy()
      if (!result.ok) {
        expect(result.error.message).toBe(InFlightTransferDbError.DOES_NOT_EXIST)
      }
    })
  })

  describe.only("getPendingInFlightTransfers", () => {
    it("should return empty when no records", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const result = database.getPendingInFlightTransfers()
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value).toEqual(new Map<string, InFlightTransfer>())
      }
    })
    it("should return empty when no-pending/only-completed records", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)
      database.completedInFlightTransfers(record0.address)

      const result = database.getPendingInFlightTransfers()
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value).toEqual(new Map<string, InFlightTransfer>())
      }
    })
    it("should return records when pending records exit", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)
      database.completedInFlightTransfers(record0.address)

      const record1 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_01",
        1,
        "memo_01",
      )
      database.insertInFlightTransfers(record1)

      const result = database.getPendingInFlightTransfers()
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value.size).toBe(1)
        const myPendingRecord = result.value.get(record1.address)
        expect(myPendingRecord).toEqual(record1)
      }
    })
    it("should return filtered records based on direction", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const record0 = new InFlightTransfer(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
        "address_00",
        0,
        "memo_00",
      )
      database.insertInFlightTransfers(record0)

      const record1 = new InFlightTransfer(
        InFlightTransferDirection.WITHDRAW_TO_WALLET,
        "address_01",
        1,
        "memo_01",
      )
      database.insertInFlightTransfers(record1)

      let result = database.getPendingInFlightTransfers(
        InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
      )
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value.size).toBe(1)
        const myPendingRecord = result.value.get(record0.address)
        expect(myPendingRecord).toEqual(record0)
      }

      result = database.getPendingInFlightTransfers(
        InFlightTransferDirection.WITHDRAW_TO_WALLET,
      )
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        expect(result.value.size).toBe(1)
        const myPendingRecord = result.value.get(record1.address)
        expect(myPendingRecord).toEqual(record1)
      }
    })
  })

  describe.only("getAllInFlightTransfers", () => {
    it("should return correct number of records", async () => {
      const logger = baseLogger.child({ module: "InFlightTransfer.spec.ts" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      for (let i = 0; i < 5; i++) {
        const record = new InFlightTransfer(
          InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
          `address_0${i}`,
          i,
          `memo_0${i}`,
        )
        const result = database.insertInFlightTransfers(record)
        expect(result.ok).toBeTruthy()
        const records = database.getAllInFlightTransfers()
        expect(records.ok).toBeTruthy()
        if (records.ok) {
          expect(records.value.size).toBe(i + 1)
        }
      }
    })
  })
})
