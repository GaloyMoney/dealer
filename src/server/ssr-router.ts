import express from "express"

import { serverRenderer } from "../renderers/server"
import { checkRoute } from "./routes"
import { handleRegister, handleLogin, handleRecovery, handleLogout } from "../kratos"
import config from "../store/config"

const ssrRouter = express.Router({ caseSensitive: true })

ssrRouter.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = checkRoute(routePath)
    if (!(checkedRoutePath instanceof Error)) {
      const vars = await serverRenderer(req)({
        path: checkedRoutePath,
      })
      return res.render("index", vars)
    }

    let flowData = undefined
    switch (routePath) {
      case "/register": {
        const registerResult = await handleRegister(req, config.kratosBrowserUrl)
        if (registerResult.redirect) {
          return res.redirect(registerResult.redirectTo)
        }
        flowData = registerResult.flowData
        break
      }

      case "/login": {
        const loginResult = await handleLogin(req, config.kratosBrowserUrl)
        if (loginResult.redirect) {
          return res.redirect(loginResult.redirectTo)
        }
        flowData = loginResult.flowData
        break
      }

      case "/recovery": {
        const recoveryResult = await handleRecovery(req, config.kratosBrowserUrl)
        if (recoveryResult.redirect) {
          return res.redirect(recoveryResult.redirectTo)
        }
        flowData = recoveryResult.flowData
        break
      }

      case "/logout": {
        req.session = req.session || {}
        req.session.authSession = undefined
        const logoutResult = await handleLogout(req)

        return res.redirect(logoutResult.redirectTo)
      }

      default:
        return res.status(404).send("Resource not found")
    }
    const vars = await serverRenderer(req)({
      path: routePath,
      flowData,
    })
    return res.render("index", vars)
  } catch (err) {
    console.error(err)
    return res.status(500).send("Server error")
  }
})

export default ssrRouter
