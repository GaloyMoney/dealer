import {
  formatRelativeTime,
  formatTime,
  formatUsd,
  GaloyGQL,
  translate,
} from "@galoymoney/client"
import { SatFormat } from "@galoymoney/react"
import { useState } from "react"

export const BLOCKCHAIN_EXPLORER_URL = "https://mempool.space/tx/"

// BLOCKCHAIN_EXPLORER_URL + hash

const typeDisplay = (type: SettlementType) => {
  switch (type) {
    case "SettlementViaOnChain":
      return "OnChain Payment"
    case "SettlementViaLn":
      return "Lightning Payment"
    case "SettlementViaIntraLedger":
      return "Galoy Payment"
  }
}

const computeUsdAmount = (tx: GaloyGQL.Transaction) => {
  const { settlementAmount, settlementPrice } = tx
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  return settlementAmount * usdPerSat
}

const descriptionDisplay = (tx: GaloyGQL.Transaction) => {
  const { memo, direction, settlementVia } = tx
  if (memo) {
    return memo
  }

  const isReceive = direction === "RECEIVE"

  switch (settlementVia.__typename) {
    case "SettlementViaOnChain":
      return "OnChain Payment"
    case "SettlementViaLn":
      return "Lightning Payment"
    case "SettlementViaIntraLedger":
      return isReceive
        ? `From ${settlementVia.counterPartyUsername || "Galoy Wallet"}`
        : `To ${settlementVia.counterPartyUsername || "Galoy Wallet"}`
  }
}

type Props = {
  tx: GaloyGQL.Transaction
}

const TransactionItem = ({ tx }: Props) => {
  const [showDetails, setShowDetails] = useState(false)

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"
  const description = descriptionDisplay(tx)
  const usdAmount = computeUsdAmount(tx)

  const handleOnClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    setShowDetails(!showDetails)
  }

  if (showDetails) {
    return (
      <div
        className={`transaction-item pending-${isPending} direction-${tx.direction.toLocaleLowerCase()}`}
      >
        <div className="transaction-summary" onClick={handleOnClick}>
          <div className="icon">
            <i
              aria-hidden
              className={`fas ${isReceive ? "fa-dot-circle" : "fa-paper-plane"}`}
            />
          </div>

          <div className="content">
            <div className="description">{typeDisplay(tx.settlementVia.__typename)}</div>
            <div className="date">{formatTime(tx.createdAt)}</div>
          </div>

          <div className="amount">
            <div>
              <SatFormat amount={tx.settlementAmount} />
            </div>
            <div className="converted-usd">{formatUsd(usdAmount)}</div>
          </div>
        </div>

        <div className={`transaction-details pending_${isPending}`}>
          <div>
            <div className="label">{translate("Description")}</div>
            <div className="value">{description}</div>
          </div>

          {!isReceive && (
            <div>
              <div className="label">{translate("Fee")}</div>
              <div className="value">
                <SatFormat amount={tx.settlementFee} />
              </div>
            </div>
          )}

          {tx.settlementVia.__typename === "SettlementViaIntraLedger" && (
            <div>
              <div className="label">
                {translate(isReceive ? "Received from" : "Sent to")}
              </div>
              <div className="value">
                {tx.settlementVia.counterPartyUsername || "Galoy Wallet"}
              </div>
            </div>
          )}

          {tx.settlementVia.__typename === "SettlementViaLn" && (
            <div>
              <div className="label">{translate("Hash")}</div>
              <div className="value">
                {(tx.initiationVia as GaloyGQL.InitiationViaLn).paymentHash}
              </div>
            </div>
          )}

          {tx.settlementVia.__typename === "SettlementViaOnChain" && (
            <div>
              <div className="label">{translate("Hash")}</div>
              <div className="value">
                <a
                  href={`${BLOCKCHAIN_EXPLORER_URL}${tx.settlementVia.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tx.settlementVia.transactionHash}
                </a>
              </div>
            </div>
          )}

          {tx.id && (
            <div>
              <div className="label">ID</div>
              <div className="value">{tx.id}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`transaction-item pending-${isPending} direction-${tx.direction.toLocaleLowerCase()}`}
    >
      <div className="transaction-summary" onClick={handleOnClick}>
        <div className="icon">
          <i
            aria-hidden
            className={`fas ${isReceive ? "fa-dot-circle" : "fa-paper-plane"}`}
          />
        </div>

        <div className="content">
          <div className="description">{description}</div>
          <div className="date">{formatRelativeTime(tx.createdAt)}</div>
        </div>

        <div className="amount">
          <div>
            <SatFormat amount={tx.settlementAmount} />
          </div>
          <div className="converted-usd">{formatUsd(usdAmount)}</div>
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
