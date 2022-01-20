import { mutations } from "@galoymoney/client"
import "cross-fetch/polyfill" // The Apollo client depends on fetch
import express from "express"
import client from "./graphql"

const apiRouter = express.Router({ caseSensitive: true })

apiRouter.post("/login", async (req, res) => {
  try {
    const { phoneNumber, authCode } = req.body

    if (!phoneNumber || !authCode) {
      throw new Error("INVALID_LOGIN_REQUEST")
    }

    const { data } = await client(req).mutate({
      mutation: mutations.userLogin,
      variables: { input: { phone: phoneNumber, code: authCode } },
    })

    if (data?.userLogin?.errors?.length > 0 || !data?.userLogin?.authToken) {
      throw new Error(data?.userLogin?.errors?.[0].message || "SOMETHING_WENT_WRONG")
    }

    const authToken = data?.userLogin?.authToken

    req.session = req.session || {}
    req.session.authToken = authToken

    return res.send({ authToken })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "SOMETHING_WENT_WRONG" })
  }
})

apiRouter.post("/logout", async (req, res) => {
  req.session = req.session || {}
  req.session.authToken = null
  return res.send({ authToken: null })
})

export default apiRouter
