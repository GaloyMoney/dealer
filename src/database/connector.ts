import { Pool } from "pg"
import pgPromise from "pg-promise"

import dotenv from "dotenv"
dotenv.config()

const DATABASE_CONNECTION_STRING = process.env["DATABASE_URL"]
export const dbConnectionPool = new Pool({
  max: 20,
  connectionString: DATABASE_CONNECTION_STRING,
  idleTimeoutMillis: 30000,
})

export const pgp = pgPromise({})
export const db = pgp({
  connectionString: DATABASE_CONNECTION_STRING,
  allowExitOnIdle: true,
})
