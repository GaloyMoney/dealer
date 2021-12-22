import "cross-fetch/polyfill" // The URQL client depends on fetch
import express from "express"
import MUTATION_USER_LOGIN from "store/graphql/mutation.user-login"
import client from "./graphql"

const apiRouter = express.Router({ caseSensitive: true })

apiRouter.post("/login", async (req, res) => {
  try {
    const { phoneNumber, authCode } = req.body

    if (!phoneNumber || !authCode) {
      throw new Error("INVALID_LOGIN_REQUEST")
    }

    const { error, data } = await client(req)
      .mutation(MUTATION_USER_LOGIN, {
        input: { phone: phoneNumber, code: authCode },
      })
      .toPromise()

    if (error || data?.userLogin?.errors?.length > 0 || !data?.userLogin?.authToken) {
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
