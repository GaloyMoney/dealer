import bodyParser from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import morgan from "morgan"
import serialize from "serialize-javascript"

import config from "./config"
import { serverRenderer } from "renderers/server"
import { SupportedRoutes } from "./routes"

const app = express()
app.enable("trust proxy")
app.use(morgan("common"))
app.use(express.static("public"))
app.set("view engine", "ejs")

app.use(
  cookieSession({
    name: "session",
    keys: ["temp"],
    secure: !config.isDev,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }),
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.locals.serialize = serialize

if (config.isDev) {
  app.locals.gVars = {
    main: ["main.css", "main.js"],
    vendor: "vendor.js",
  }
} else {
  try {
    app.locals.gVars = require("../../.gvars.json")
  } catch (err) {
    console.error("Webpack generated assets file is missing")
  }
}

app.post("/api/login", async (req, res) => {
  try {
    const authToken = req.headers.authorization?.slice(7)
    req.session = req.session || {}
    req.session.authToken = authToken
    return res.send({ authToken })
  } catch (err) {
    console.error(err)
    return res.status(500).send("Server error")
  }
})

app.post("/api/logout", async (req, res) => {
  req.session = req.session || {}
  req.session.authToken = null
  return res.send({ authToken: null })
})

app.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = SupportedRoutes.find(
      (supportedRoute) => supportedRoute === routePath,
    )
    if (!checkedRoutePath) {
      return res.status(404)
    }
    const vars = await serverRenderer({
      path: checkedRoutePath,
      authToken: req.session?.authToken,
    })
    return res.render("index", vars)
  } catch (err) {
    console.error(err)
    return res.status(500).send("Server error")
  }
})

app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`)
})
