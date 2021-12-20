import express from "express"

import { serverRenderer } from "renderers/server"
import { SupportedRoutes } from "./routes"

const ssrRouter = express.Router({ caseSensitive: true })

ssrRouter.get("/*", async (req, res) => {
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

export default ssrRouter
