import { createClient } from "@urql/core"
import { Request } from "express"

import config from "./config"

const client = (req: Request) =>
  createClient({
    url: config.graphqlUri,
    fetchOptions: () => {
      const token = req.session?.authToken
      return {
        headers: { authorization: token ? `Bearer ${token}` : "" },
      }
    },
  })

export default client
