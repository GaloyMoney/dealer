import request from "supertest"
import express from "express"
import serialize from "serialize-javascript"

import ssrRouter from "./ssr-router"

jest.mock("../store/config", () => ({
  config: {
    isBrowser: false,
    walletName: "Galoy",
    kratosFeatureFlag: true,
  },
  publicConfig: { walletName: "Galoy" },
}))

const mockDataPromise = () => Promise.resolve({ data: undefined })

jest.mock("../kratos/sdk", () => ({
  ...jest.requireActual("../kratos/sdk"),
  KratosSdk: () => ({
    getSelfServiceRegistrationFlow: mockDataPromise,
    getSelfServiceLoginFlow: mockDataPromise,
    getSelfServiceRecoveryFlow: mockDataPromise,
  }),
}))

jest.mock("../kratos/helpers", () => ({
  ...jest.requireActual("../kratos/helpers"),
  getUrlForFlow: () => "test",
}))

const app = express()
app.set("view engine", "ejs")

app.locals.serialize = serialize
app.locals.gVars = {
  main: ["main.css", "main.js"],
  vendor: "vendor.js",
}

app.use("/", ssrRouter)

const textToHtml = (text: string): HTMLHtmlElement => {
  const html = document.createElement("html")
  html.innerHTML = text
  return html
}

describe("ssrRouter", () => {
  it("responds to /", async () => {
    const res = await request(app).get("/")

    expect(res.header["content-type"]).toBe("text/html; charset=utf-8")
    expect(res.statusCode).toBe(200)

    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Galoy Web Wallet")
    expect(html.querySelector(".balance")?.textContent).toMatch("Current Balance")
  })

  it("responds to /send", async () => {
    const res = await request(app).get("/send")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Send Bitcoin")
  })

  it("responds to /scan", async () => {
    const res = await request(app).get("/scan")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Send Bitcoin")
  })

  it("responds to /receive", async () => {
    const res = await request(app).get("/receive")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Receive Bitcoin")
  })

  it("responds to /contacts", async () => {
    const res = await request(app).get("/contacts")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Contacts")
  })

  it("responds to /transactions", async () => {
    const res = await request(app).get("/transactions")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Transactions with Contact")
  })

  it("responds to /settings", async () => {
    const res = await request(app).get("/settings")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Settings")
  })
})

describe("ssrRouter for auth routes", () => {
  it("responds to /register", async () => {
    const res = await request(app).get("/register?flow=test")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual(
      "Create new account for Galoy Web Wallet",
    )
  })

  it("responds to /login", async () => {
    const res = await request(app).get("/login?flow=test")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual("Login to Galoy Web Wallet")
  })

  it("responds to /recovery", async () => {
    const res = await request(app).get("/recovery?flow=test")
    const html = textToHtml(res.text)

    expect(html.querySelector("title")?.textContent).toEqual(
      "Recover your Galoy Web Wallet",
    )
  })
})
