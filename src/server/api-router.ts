import express from "express"

import { MUTATIONS } from "@galoymoney/client"

import { createClient } from "../store"

const apiRouter = express.Router({ caseSensitive: true })

apiRouter.post("/login", async (req, res) => {
  try {
    const { phoneNumber, authCode } = req.body

    if (!phoneNumber || !authCode) {
      throw new Error("INVALID_LOGIN_REQUEST")
    }

    const { data } = await createClient({
      headers: req.headers,
    }).mutate({
      mutation: MUTATIONS.userLogin,
      variables: { input: { phone: phoneNumber, code: authCode } },
    })

    if (data?.userLogin?.errors?.length > 0 || !data?.userLogin?.authToken) {
      throw new Error(data?.userLogin?.errors?.[0].message || "Something went wrong")
    }

    const authToken = data?.userLogin?.authToken

    req.session = req.session || {}
    req.session.authToken = authToken

    return res.send({ authToken })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "Something went wrong" })
  }
})

apiRouter.post("/logout", async (req, res) => {
  req.session = req.session || {}
  req.session.authToken = null
  return res.send({ authToken: null })
})

export default apiRouter
