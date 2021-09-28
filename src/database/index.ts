import pgPromise, { IInitOptions, IDatabase, IMain } from "pg-promise"
import { Extensions, InFlightTransfersRepository } from "./repositories"
import { baseLogger } from "../services/logger"

const DATABASE_CONNECTION_STRING = process.env["DATABASE_URL"]

// Extending the database protocol with custom repositories
type ExtendedProtocol = IDatabase<Extensions> & Extensions
const initOptions: IInitOptions<Extensions> = {
  /* eslint-disable */
  extend(obj: ExtendedProtocol, dc: any) {
    /* eslint-enable */
    // Database Context (dc) is  for extending multiple databases with different access API.

    obj.inFlightTransfers = new InFlightTransfersRepository(baseLogger, obj, pgp)
  },
}

const pgp: IMain = pgPromise(initOptions)
const db: ExtendedProtocol = pgp({
  connectionString: DATABASE_CONNECTION_STRING,
  allowExitOnIdle: true,
})

export { db, pgp }
