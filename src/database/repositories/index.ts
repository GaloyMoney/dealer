import { InFlightTransfersRepository } from "./InFlightTransfersRepository"
import { GraphqlRepository } from "./GraphqlRepository"

interface Extensions {
  inFlightTransfers: InFlightTransfersRepository
  graphql: GraphqlRepository
}

export { Extensions, InFlightTransfersRepository, GraphqlRepository }
