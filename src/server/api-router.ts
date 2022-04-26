import express from "express"
import * as jwt from "jsonwebtoken"

import { MUTATIONS } from "@galoymoney/client"

import { createClient } from "store/index"
import { handleWhoAmI } from "kratos/index"

const apiRouter = express.Router({ caseSensitive: true })

export type GalowyJwtToken = null | (jwt.JwtPayload & { kratosUserId?: string })

apiRouter.post("/login", async (req, res) => {
  try {
    const { authToken, phoneNumber, authCode } = req.body

    if (authToken) {
      const token = jwt.decode(authToken) as GalowyJwtToken
      const kratosSession = await handleWhoAmI(req)

      if (!token || !token.uid || !kratosSession) {
        throw new Error("INVALID_LOGIN_REQUEST")
      }

      const authSession = {
        galoyJwtToken: authToken,
        identity: {
          id: kratosSession.identity.id,
          uid: token.uid,
          emailAddress: kratosSession.identity.traits.email,
          firstName: kratosSession.identity.traits.name?.first,
          lastName: kratosSession.identity.traits.name?.last,
        },
      }

      req.session = req.session || {}
      req.session.authSession = authSession
      return res.send(authSession)
    }

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

    const galoyJwtToken = data?.userLogin?.authToken
    const token = jwt.decode(galoyJwtToken) as GalowyJwtToken

    if (!token || !token.uid) {
      return res.status(404).send("Invalid login request")
    }

    const authSession = {
      identity: { userId: token.uid, phoneNumber },
      galoyJwtToken,
    }

    req.session = req.session || {}
    req.session.authSession = authSession
    return res.send(authSession)
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "Something went wrong" })
  }
})

export default apiRouter
