import { config, publicConfig } from "./config"

describe("config", () => {
  it("has isBrowser", () => {
    expect(config.isBrowser).toBe(true)
  })
  it("includes __G_DATA", () => {
    expect(config).toMatchObject(window.__G_DATA.GwwConfig)
    expect(config.network).toBe("signet") // from the window.__G_DATA mock
  })
})

describe("publicConfig", () => {
  it("includes __G_DATA", () => {
    expect(publicConfig).toMatchObject(window.__G_DATA.GwwConfig)
  })
  it("does not included all config", () => {
    expect(publicConfig.isBrowser).toBe(undefined)
  })
})
