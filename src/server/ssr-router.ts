import express from "express"

import { serverRenderer } from "../renderers/server"
import { checkRoute } from "./routes"

const ssrRouter = express.Router({ caseSensitive: true })

ssrRouter.get("/logout", async (req, res) => {
  req.session = req.session || {}
  req.session.galoyJwtToken = null
  return res.redirect("/")
})

ssrRouter.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = checkRoute(routePath)
    if (checkedRoutePath instanceof Error) {
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
