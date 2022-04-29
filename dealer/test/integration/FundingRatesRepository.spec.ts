import { ExchangeNames, FundingRate } from "src/database/models"
import { db as database } from "src/database"

function getValidFundingRateApiResponse() {
  const currentEpoch = new Date().getTime()
  const oneDayOffset = 24 * 60 * 60 * 1000
  return {
    code: "0",
    data: [
      {
        fundingRate: "0.05",
        fundingTime: `${currentEpoch - 1 * oneDayOffset}`, // one day earlier
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        realizedRate: "0.05",
      },
      {
        fundingRate: "-0.0476190476190477",
        fundingTime: `${currentEpoch - 2 * oneDayOffset}`, // two days earlier
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        realizedRate: "-0.0476190476190477",
      },
      {
        fundingRate: "0.05",
        fundingTime: `${currentEpoch - 3 * oneDayOffset}`, // three days earlier
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        realizedRate: "0.05",
      },
      {
        fundingRate: "0.05",
        fundingTime: `${currentEpoch - 4 * oneDayOffset}`, // four days earlier
        instId: "BTC-USD-SWAP",
        instType: "SWAP",
        realizedRate: "0.05",
      },
    ],
    msg: "",
  }
}

function getValidFundingRateFromApiResponse(apiResponse): FundingRate[] {
  const fundingRates: FundingRate[] = []

  if (apiResponse?.data) {
    for (const rawFundingRate of apiResponse?.data) {
      const fundingRate: FundingRate = {
        fundingRate: Number(rawFundingRate.fundingRate),
        instrumentId: rawFundingRate.instId,
        exchangeName: ExchangeNames.Okex,

        timestamp: new Date(Number(rawFundingRate.fundingTime)).toUTCString(),
        fundingTime: Number(rawFundingRate.fundingTime),
      }
      fundingRates.push(fundingRate)
    }
  }

  return fundingRates
}

describe("FundingRatesRepository", () => {
  describe("insertFundingRates", () => {
    it("should create a row in the database table", async () => {
      // clear db
      const clearResult = await database.fundingRates.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      const apiResponse = getValidFundingRateApiResponse()
      const fundingRates = getValidFundingRateFromApiResponse(apiResponse)
      const aFundingRate: FundingRate = fundingRates[0]
      const result = await database.fundingRates.insert(aFundingRate)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate existing data
      expect(result.value).toBeTruthy()
      expect(result.value.fundingRate).toBe(String(aFundingRate.fundingRate))
      expect(result.value.fundingTime).toBe(String(aFundingRate.fundingTime))
      expect(result.value.instrumentId).toBe(aFundingRate.instrumentId)

      // validate created data
      expect(result.value.id).toBeTruthy()
      expect(result.value.id).toBeGreaterThanOrEqual(0)
      expect(result.value.timestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toBeTruthy()
      expect(result.value.updatedTimestamp).toBeTruthy()
      expect(result.value.createdTimestamp).toEqual(result.value.updatedTimestamp)

      // clear db
      await database.fundingRates.clearAll()
    })
  })
  describe("clearAllFundingRates", () => {
    it("should truncate all rows from the database table", async () => {
      // insert data
      const apiResponse = getValidFundingRateApiResponse()
      const fundingRates = getValidFundingRateFromApiResponse(apiResponse)
      for (const fundingRate of fundingRates) {
        const insertResult = await database.fundingRates.insert(fundingRate)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      // test functionality
      const result = await database.fundingRates.clearAll()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      // validate
      const countResult = await database.fundingRates.getCount()
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
      const clearResult = await database.fundingRates.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidFundingRateApiResponse()
      const fundingRates = getValidFundingRateFromApiResponse(apiResponse)
      let expectedCount = 0
      for (const fundingRate of fundingRates) {
        const insertResult = await database.fundingRates.insert(fundingRate)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        ++expectedCount
      }

      // test functionality
      const countResult = await database.fundingRates.getCount()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      expect(countResult.value).toBe(expectedCount)
    })
  })
  describe("getFundingYield", () => {
    it("should return exact yield from the database table", async () => {
      // clear db
      const clearResult = await database.fundingRates.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert data
      const apiResponse = getValidFundingRateApiResponse()
      const fundingRates = getValidFundingRateFromApiResponse(apiResponse)
      for (const fundingRate of fundingRates) {
        const insertResult = await database.fundingRates.insert(fundingRate)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
      }

      const tests = [
        { numberOfDays: 0, expectedYield: 0.0 },
        { numberOfDays: 2, expectedYield: 0.05 },
        { numberOfDays: 3, expectedYield: 0.0 },
        { numberOfDays: 4, expectedYield: 0.05 },
        { numberOfDays: 5, expectedYield: 0.1025 },
      ]

      for (const test of tests) {
        // test functionality
        const yieldResult = await database.fundingRates.getFundingYield(
          ExchangeNames.Okex,
          test.numberOfDays,
        )
        expect(yieldResult).toBeTruthy()
        expect(yieldResult.ok).toBeTruthy()
        if (!yieldResult.ok) {
          return
        }

        // validate
        expect(Number(yieldResult.value)).toBe(test.expectedYield)
      }
    })
  })
  describe("getLastFundingTime", () => {
    it("should get null funding_time when no fundingRates in the database table", async () => {
      // clear db
      const clearResult = await database.fundingRates.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // test functionality
      const countResult = await database.fundingRates.getLastFundingTime()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      const fundingTime = countResult.value
      expect(fundingTime).toBeFalsy()
    })
    it("should get most recent funding_time from the database table", async () => {
      // clear db
      const clearResult = await database.fundingRates.clearAll()
      expect(clearResult).toBeTruthy()
      expect(clearResult.ok).toBeTruthy()

      // insert all data
      const apiResponse = getValidFundingRateApiResponse()
      const fundingRates = getValidFundingRateFromApiResponse(apiResponse)
      let expectedFundingTime = ""
      let maxTimestamp = 0
      for (const fundingRate of fundingRates) {
        const insertResult = await database.fundingRates.insert(fundingRate)
        expect(insertResult).toBeTruthy()
        expect(insertResult.ok).toBeTruthy()
        const ts = Number(fundingRate.fundingTime)
        if (ts > maxTimestamp) {
          maxTimestamp = ts
          expectedFundingTime = `${fundingRate.fundingTime}`
        }
      }

      // test functionality
      const countResult = await database.fundingRates.getLastFundingTime()
      expect(countResult).toBeTruthy()
      expect(countResult.ok).toBeTruthy()
      if (!countResult.ok) {
        return
      }

      // validate
      const fundingTime = countResult.value
      expect(fundingTime).toBeTruthy()
      expect(fundingTime).toBe(expectedFundingTime)
    })
  })
})
