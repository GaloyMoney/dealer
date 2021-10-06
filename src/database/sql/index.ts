import { QueryFile, IQueryFileOptions } from "pg-promise"
import { join as joinPath } from "path"
import { baseLogger } from "../../services/logger"

const logger = baseLogger.child({ module: "db/queries" })

export const inFlightTransfersQueries = {
  insert: sql("in_flight_transfers/insert.sql"),
  complete: sql("in_flight_transfers/complete.sql"),

  get_all: sql("in_flight_transfers/get_all.sql"),
  get_pending: sql("in_flight_transfers/get_pending.sql"),
  get_pending_count: sql("in_flight_transfers/get_pending_count.sql"),
  get_pending_deposit: sql("in_flight_transfers/get_pending_deposit.sql"),
  get_pending_withdraw: sql("in_flight_transfers/get_pending_withdraw.sql"),
  get_this: sql("in_flight_transfers/get_this.sql"),

  clear: sql("in_flight_transfers/clear.sql"),
}

export const graphql = {
  get_last_on_chain_address: sql("graphql/get_last_on_chain_address.sql"),
  get_wallet: sql("graphql/get_wallet.sql"),
  get_on_chain_pay: sql("graphql/get_on_chain_pay.sql"),
  set_on_chain_pay: sql("graphql/set_on_chain_pay.sql"),
}

function sql(file: string): QueryFile {
  const fullPath: string = joinPath(__dirname, file)

  // minify => scrubs comments, etc. contained in sql file
  const options: IQueryFileOptions = { minify: true }

  const qf: QueryFile = new QueryFile(fullPath, options)
  if (qf.error) {
    logger.error(
      { QueryFileError: qf.error, fullPath, options },
      "Error while loading SQL Query Files",
    )
  }
  return qf
}
