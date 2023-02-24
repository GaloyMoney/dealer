import express from "express"

import { handleWhoAmI } from "kratos/index"
import { Request, Response } from "express-serve-static-core"

const apiRouter = express.Router({ caseSensitive: true })

apiRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const kratosSession = await handleWhoAmI(req)

    if (!kratosSession) {
      return res.status(401).send("Invalid auth token")
    }

    const authSession = {
      identity: {
        id: kratosSession.identity.id,
        uid: kratosSession.identity.id,
        phoneNumber: kratosSession.identity.traits?.phone,
        emailAddress: kratosSession.identity.traits?.email,
        firstName: kratosSession.identity.traits.name?.first,
        lastName: kratosSession.identity.traits.name?.last,
      },
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
