import { useState } from "react"

import { translate, NoPropsFCT, useAppDispatcher } from "store/index"

import Header from "components/header"
import InvoiceOverview from "components/receive/overview"
import InvoiceInput from "components/receive/input"
import useMainQuery from "hooks/use-main-query"
import { GaloyGQL } from "@galoymoney/client"
import { SuccessCheckmark } from "@galoymoney/react"

export type ReceiveScreenInput = {
  view: "overview" | "input" | "success"
  layer: "lightning" | "onchain"
  currency: "USD" | "SATS"
  amount?: number | ""
  memo?: string
  satAmount?: number
  usdAmount?: number
  wallet: GaloyGQL.Wallet
}

export type ConvertedValuesType = null | { usd: number; sats?: number }

const Receive: NoPropsFCT = () => {
  const dispatch = useAppDispatcher()
  const { btcWallet, usdWallet } = useMainQuery()

  const [input, setInput] = useState<ReceiveScreenInput>({
    view: "overview",
    layer: "lightning",
    currency: "USD",
    amount: 0,
    satAmount: 0,
    usdAmount: 0,
    memo: "",
    wallet: btcWallet,
  })

  const toggleWallet = () => {
    setInput((currInput) => ({
      ...currInput,
      amount: 0,
      satAmount: 0,
      usdAmount: 0,
      memo: "",
      wallet: input.wallet.walletCurrency === "BTC" ? usdWallet : btcWallet,
      layer:
        input.wallet.walletCurrency === "BTC" && currInput.layer === "onchain"
          ? "lightning"
          : currInput.layer,
    }))
  }

  const resetReceiveScreen = () => {
    dispatch({ type: "navigate", path: "/receive" })
  }

  return (
    <div className="receive">
      <Header page="receive-bitcoin" />

      <div className="page-title">{translate("Receive Bitcoin")}</div>

      {input.view === "success" && (
        <div className="invoice-status">
          <SuccessCheckmark />
          <button onClick={resetReceiveScreen}>
            {translate("Receive another payment")}
          </button>
        </div>
      )}

      {input.view === "overview" && (
        <InvoiceOverview input={input} setInput={setInput} toggleWallet={toggleWallet} />
      )}

      {input.view === "input" && <InvoiceInput input={input} setInput={setInput} />}
    </div>
  )
}

export default Receive
