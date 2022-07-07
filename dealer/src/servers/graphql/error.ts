import { ApolloError } from "apollo-server-errors"
import { Logger } from "pino"

type levelType = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent"

export class CustomApolloError extends ApolloError {
  log
  forwardToClient

  constructor(
    message: string,
    code: string,
    {
      forwardToClient,
      logger,
      level,
      metadata,
    }: { forwardToClient: boolean; logger: Logger; metadata; level: levelType },
  ) {
    super(message, code, { metadata })
    this.log = logger[level].bind(logger)
    this.forwardToClient = forwardToClient
  }
}
