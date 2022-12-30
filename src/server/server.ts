import bodyParser from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import morgan from "morgan"
import serialize from "serialize-javascript"
import rateLimit from "express-rate-limit"

import { config, helmetConfig } from "store/index"

import apiRouter from "server/api-router"
import ssrRouter from "server/ssr-router"

const app = express()
app.enable("trust proxy")
app.use(morgan("common"))
app.use(express.static("public"))
app.set("view engine", "ejs")

if (!config.isDev) {
  app.use(helmetConfig)
}

app.use(
  cookieSession({
    name: "session",
    keys: [config.sessionKeys as string],
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

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 21,
})

app.use(limiter)

app.use("/api", apiRouter)
app.use("/", ssrRouter)

app.listen(config.port as number, config.host as string, () => {
  console.info(`Running on http://${config.host}:${config.port}...`)
})
