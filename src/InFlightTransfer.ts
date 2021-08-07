import fs from "fs"
import pino from "pino"

export enum InFlightTransferStatus {
  PENDING = "pending",
  DONE = "done",
}

export class InFlightTransfer {
  createdTimestamp: Date
  updatedTimestamp: Date
  logger: pino.Logger
  constructor(
    public address: string,
    public transferSizeInSats: number,
    public memo: string,
    public status: InFlightTransferStatus,
    logger,
  ) {
    this.logger = logger.child({ class: InFlightTransfer.name })
    this.createdTimestamp = this.updatedTimestamp = new Date()
  }

  public save() {
    const logger = this.logger.child({ method: "save()" })
    const filename = `${this.address}.json`
    this.updatedTimestamp = new Date()
    fs.writeFile(filename, JSON.stringify(this), function (err) {
      if (err) return logger.debug(err)
    })
  }
}
