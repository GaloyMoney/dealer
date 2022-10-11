import { useState } from "react"

import { translate, NoPropsFCT } from "store/index"

import Header from "components/header"
import InvoiceOverview from "components/receive/overview"
import InvoiceInput from "components/receive/input"

export type ReceiveScreenInput = {
  view: "overview" | "input"
  layer: "lightning" | "onchain"
  currency: "USD" | "SATS"
  amount?: number | ""
  memo?: string
  satAmount?: number
  usdAmount?: number
}

export type ConvertedValuesType = null | { usd: number; sats?: number }

const Receive: NoPropsFCT = () => {
  const [input, setInput] = useState<ReceiveScreenInput>({
    view: "overview",
    layer: "lightning",
    currency: "USD",
    amount: 0,
    satAmount: 0,
    memo: "",
  })

  return (
    <div className="receive">
      <Header page="receive-bitcoin" />

      <div className="page-title">{translate("Receive Bitcoin")}</div>

      {input.view === "overview" && <InvoiceOverview input={input} setInput={setInput} />}

      {input.view === "input" && <InvoiceInput input={input} setInput={setInput} />}
    </div>
  )
}

export default Receive
