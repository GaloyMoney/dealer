import express from "express"
import * as jwt from "jsonwebtoken"

import { MUTATIONS } from "@galoymoney/client"

import { createClient } from "store/index"
import { handleWhoAmI } from "kratos/index"
import { Request, Response } from "express-serve-static-core"

const apiRouter = express.Router({ caseSensitive: true })

export type GalowyJwtToken = null | (jwt.JwtPayload & { kratosUserId?: string })

const loginUsingKratos = async ({
  authToken,
  req,
  res,
}: {
  authToken: string
  req: Request
  res: Response
}) => {
  const token = jwt.decode(authToken) as GalowyJwtToken
  const kratosSession = await handleWhoAmI(req)

  if (!token || !token.uid || !kratosSession) {
    return res.status(401).send("Invalid auth token")
  }

  const authSession = {
    galoyJwtToken: authToken,
    identity: {
      id: kratosSession.identity.id,
      uid: token.uid,
      uidc: token.uid.slice(-6) + kratosSession.identity.id.slice(-6),
      emailAddress: kratosSession.identity.traits.email,
      firstName: kratosSession.identity.traits.name?.first,
      lastName: kratosSession.identity.traits.name?.last,
    },
  }

  req.session = req.session || {}
  req.session.authSession = authSession
  return res.send(authSession)
}

const loginUsingPhoneNumber = async ({
  phoneNumber,
  authCode,
  req,
  res,
}: {
  phoneNumber: string
  authCode: string
  req: Request
  res: Response
}) => {
  if (!phoneNumber) {
    return res.status(400).send("Phone number is required")
  }
  if (!authCode) {
    return res.status(400).send("Auth code is required")
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

  const authSession = {
    identity: {
      id: galoyJwtToken,
      uid: galoyJwtToken,
      uidc: galoyJwtToken.slice(-6) + galoyJwtToken.slice(-6), // FIXME: Get from backend
      phoneNumber,
    },
    galoyJwtToken,
  }

  req.session = req.session || {}
  req.session.authSession = authSession
  return res.send(authSession)
}

apiRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const {
      authToken = "",
      phoneNumber = "",
      authCode = "",
    }: { authToken: string; phoneNumber: string; authCode: string } = req.body
    if (authToken) {
      return await loginUsingKratos({ authToken, req, res })
    } else if (phoneNumber || authCode) {
      return await loginUsingPhoneNumber({ phoneNumber, authCode, req, res })
    }
    // No auth token or phone number and auth code
    return res
      .status(400)
      .send("One of the following is required: authToken or phoneNumber & authCode")
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "Something went wrong" })
  }
})

export default apiRouter
