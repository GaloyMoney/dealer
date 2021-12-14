import bodyParser from "body-parser"
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

app.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = SupportedRoutes.find(
      (supportedRoute) => supportedRoute === routePath,
    )
    if (!checkedRoutePath) {
      return res.status(404)
    }
    const vars = await serverRenderer(checkedRoutePath)
    return res.render("index", vars)
  } catch (err) {
    console.error(err)
    return res.status(500).send("Server error")
  }
})

app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`)
})
