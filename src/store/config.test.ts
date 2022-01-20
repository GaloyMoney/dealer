import config from "./config"

describe("config", () => {
  it("has defaults", () => {
    expect(config.isBrowser).toBe(true)
    expect(config.network).toBe("testnet")
  })
})
