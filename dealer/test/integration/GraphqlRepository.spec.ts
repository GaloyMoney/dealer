import { Wallet, LastOnChainAddress, OnChainPay } from "src/database/models"
import { db as database } from "src/database"
import { baseLogger } from "src/services/logger"

describe("GraphqlRepository", () => {
  describe("getWallet", () => {
    it("should retrieve a wallet row from the database table", async () => {
      // test functionality
      const result = await database.graphql.getWallet()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      const walletRow = result.value
      expect(walletRow).toBeTruthy()
      expect(walletRow.jsonData).toBeTruthy()

      const walletObj = walletRow.jsonData[0]
      expect(walletObj).toBeTruthy()
      expect(walletObj.id).toBe("BTCWallet")
      expect(walletObj.balance).toBeGreaterThanOrEqual(0)
      expect(walletObj.walletCurrency).toBe("BTC")

      const walletObj2 = walletRow.jsonData[1]
      expect(walletObj2).toBeTruthy()
      expect(walletObj2.id).toBe("USDWallet")
      expect(walletObj2.balance).toBeLessThanOrEqual(0)
      expect(walletObj2.walletCurrency).toBe("USD")
    })
  })

  describe("getLastOnChainAddress", () => {
    it("should retrieve the last on chain address row from the database table", async () => {
      // test functionality
      const result = await database.graphql.getLastOnChainAddress()
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      const addressRow = result.value
      expect(addressRow).toBeTruthy()
      expect(addressRow.jsonData).toBeTruthy()

      const addressObj = addressRow.jsonData
      expect(addressObj).toBeTruthy()
      expect(addressObj.id).toBeTruthy()
    })
  })

  describe("setOnChainPay", () => {
    it("should create a row in the database table", async () => {
      const data = {
        address: "bc1q.01.",
        amount: 123401,
        memo: "tx01",
      }
      const jsonData = JSON.stringify(data)
      const result = await database.graphql.setOnChainPay(jsonData)
      expect(result).toBeTruthy()
      expect(result.ok).toBeTruthy()
      if (!result.ok) {
        return
      }

      const onChainPayRow = result.value
      expect(onChainPayRow).toBeTruthy()
      expect(onChainPayRow.jsonData).toBeTruthy()

      const onChainPayObj = onChainPayRow.jsonData
      expect(onChainPayObj).toBeTruthy()
      expect(onChainPayObj.address).toBeTruthy()
      expect(onChainPayObj.address).toBe(data.address)
      expect(onChainPayObj.amount).toBeTruthy()
      expect(onChainPayObj.amount).toBe(data.amount)
      expect(onChainPayObj.memo).toBeTruthy()
      expect(onChainPayObj.memo).toBe(data.memo)
    })
  })
})
