import { InFlightTransfersRepository } from "./InFlightTransfersRepository"
import { GraphqlRepository } from "./GraphqlRepository"
import { TransactionsRepository } from "./TransactionsRepository"
import { OrdersRepository } from "./OrdersRepository"
import { InternalTransfersRepository } from "./InternalTransfersRepository"
import { ExternalTransfersRepository } from "./ExternalTransfersRepository"
import { FundingRatesRepository } from "./FundingRatesRepository"

interface Extensions {
  inFlightTransfers: InFlightTransfersRepository
  graphql: GraphqlRepository
  transactions: TransactionsRepository
  orders: OrdersRepository
  internalTransfers: InternalTransfersRepository
  externalTransfers: ExternalTransfersRepository
  fundingRates: FundingRatesRepository
}

export {
  Extensions,
  InFlightTransfersRepository,
  GraphqlRepository,
  TransactionsRepository,
  OrdersRepository,
  InternalTransfersRepository,
  ExternalTransfersRepository,
  FundingRatesRepository,
}
