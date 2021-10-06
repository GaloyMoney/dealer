import pgPromise, { IInitOptions, IDatabase, IMain } from "pg-promise"
import {
  Extensions,
  InFlightTransfersRepository,
  GraphqlRepository,
} from "./repositories"
import { baseLogger } from "../services/logger"
import humps from "humps"

const DATABASE_CONNECTION_STRING = process.env["DATABASE_URL"]

// Extending the database protocol with custom repositories
type ExtendedProtocol = IDatabase<Extensions> & Extensions
const initOptions: IInitOptions<Extensions> = {
  /* eslint-disable */
  extend(obj: ExtendedProtocol, dc: any) {
    /* eslint-enable */
    // Database Context (dc) is  for extending multiple databases with different access API.

    obj.inFlightTransfers = new InFlightTransfersRepository(baseLogger, obj, pgp)
    obj.graphql = new GraphqlRepository(baseLogger, obj, pgp)
  },
  /* eslint-disable */
  receive: function (data, result, e) {
    /* eslint-enable */
    camelizeColumnNames(data)
  },
  capSQL: true,
}

function camelizeColumnNames(data) {
  const template = data[0]
  for (const prop in template) {
    const camel = humps.camelize(prop)
    if (!(camel in template)) {
      for (const d of data) {
        d[camel] = d[prop]
        delete d[prop]
      }
    }
  }
}

const pgp: IMain = pgPromise(initOptions)

//
// trying to get the bigint parse, but fails with a circular reference
// probably due to the camelizeColumnNames
//
// // Allow for postgres bigint to be parsed (vs string)
// // Type Id 20 = BIGINT | BIGSERIAL
// pgp.pg.types.setTypeParser(20, BigInt)

const db: ExtendedProtocol = pgp({
  connectionString: DATABASE_CONNECTION_STRING,
  allowExitOnIdle: true,
})

export { db, pgp }
