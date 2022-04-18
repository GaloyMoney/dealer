import express from "express"

import { serverRenderer } from "renderers/server"
import { checkRoute } from "server/routes"
import { handleRegister, handleLogin, handleRecovery, handleLogout } from "kratos/index"
import config from "store/config"

const ssrRouter = express.Router({ caseSensitive: true })

ssrRouter.get("/verified", (req, res) => {
  req.session = req.session || {}
  req.session.emailVerified = true
  res.redirect("/")
})

ssrRouter.get("/*", async (req, res) => {
  try {
    const routePath = req.path
    const checkedRoutePath = checkRoute(routePath)

    if (!(checkedRoutePath instanceof Error)) {
      const ssrVars = await serverRenderer(req)({
        path: checkedRoutePath,
      })

      if (ssrVars instanceof Error) {
        console.error(ssrVars)
        return res.status(500).send("Server error")
      }

      const { GwwConfig, GwwState, pageData, ssrData, initialMarkup } = ssrVars

      if (!GwwConfig || !GwwState || !pageData || !ssrData || !initialMarkup) {
        console.error("SSR variable(s) missing")
        return res.status(500).send("Server error")
      }
      return res.render("index", {
        GwwConfig,
        GwwState,
        pageData,
        ssrData,
        initialMarkup,
      })
    }

    if (routePath === "/logout") {
      req.session = req.session || {}
      req.session.authSession = undefined
      if (config.kratosFeatureFlag) {
        const logoutResult = await handleLogout(req)
        return res.redirect(logoutResult.redirectTo)
      }

      return res.redirect("/")
    }

    if (!config.kratosFeatureFlag) {
      return res.status(404).send("Resource not found")
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
