import express from "express"

import { serverRenderer } from "renderers/server"
import { SupportedRoutes } from "./routes"

const ssrRouter = express.Router({ caseSensitive: true })

ssrRouter.get("/logout", async (req, res) => {
  req.session = req.session || {}
  req.session.authToken = null
  return res.redirect("/")
})

ssrRouter.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = SupportedRoutes.find(
      (supportedRoute) => supportedRoute === routePath,
    )
    if (!checkedRoutePath) {
      return res.status(404).send("Resource not found")
    }
    const vars = await serverRenderer(req)({
      path: checkedRoutePath,
    })
    return res.render("index", vars)
  } catch (err) {
    console.error(err)
    return res.status(500).send("Server error")
  }
})

export default ssrRouter
