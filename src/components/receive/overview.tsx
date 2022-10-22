import { useCallback, useEffect } from "react"

import { useMutation } from "@galoymoney/client"

import { translate } from "store/index"
import useMyUpdates from "hooks/use-my-updates"
import useMainQuery from "hooks/use-main-query"

import InvoiceGenerator from "components/receive/invoice-generator"
import Link, { ButtonLink } from "components/link"
import { ReceiveScreenInput } from "components/pages/receive"

type FCT = React.FC<{
  input: ReceiveScreenInput
  setInput: React.Dispatch<React.SetStateAction<ReceiveScreenInput>>
  toggleWallet: () => void
}>

const InvoiceOverview: FCT = ({ input, setInput, toggleWallet }) => {
  const { wallets } = useMainQuery()

  const { satsToUsd } = useMyUpdates()

  const [generateBtcAddress, { loading, errorsMessage, data }] =
    useMutation.onChainAddressCurrent()

  useEffect(() => {
    if (input.layer === "onchain" && input.wallet) {
      // Layer switched to onchain, generate a btc address
      generateBtcAddress({
        variables: {
          input: { walletId: input.wallet.id },
        },
      })
    }
  }, [input.wallet, generateBtcAddress, input.layer])

  useEffect(() => {
    if (satsToUsd && input.wallet.walletCurrency !== "USD") {
      setInput((currInput) => ({
        ...currInput,
        usdAmount: satsToUsd(currInput.satAmount as number),
      }))
    }
  }, [input.wallet, satsToUsd, setInput])

  if (errorsMessage) {
    console.debug("[BTC address error]:", errorsMessage)
    throw new Error("Unable to get BTC address for wallet")
  }

  const btcAddress = data?.onChainAddressCurrent?.address ?? undefined

  const regenerateInvoice = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      satAmount: NaN,
      usdAmount: NaN,
      view: "input",
    }))
  }, [setInput])

  const InvoiceGeneratorDisplay = () => {
    if (!input.wallet) {
      return <ButtonLink to="/login">{translate("Login to send")}</ButtonLink>
    }

    const inputPending = input.amount === undefined || input.memo === undefined
    const showInvoice =
      !loading &&
      !inputPending &&
      input.satAmount !== undefined &&
      !Number.isNaN(input.satAmount)

    return (
      showInvoice && (
        <InvoiceGenerator
          layer={input.layer}
          wallet={input.wallet}
          btcAddress={btcAddress}
          regenerate={regenerateInvoice}
          amount={input.amount as number}
          currency={input.currency}
          memo={input.memo as string}
          satAmount={input.satAmount as number}
          usdAmount={input.usdAmount as number}
          onPaymentSuccess={() =>
            setInput((currInput) => ({
              ...currInput,
              satAmount: NaN,
              usdAmount: NaN,
              view: "success",
            }))
          }
        />
      )
    )
  }

  const togglePaymentLayer = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      layer: currInput.layer === "lightning" ? "onchain" : "lightning",
    }))
  }, [setInput])

  const showInputView = useCallback(() => {
    setInput((currInput) => ({
      ...currInput,
      view: "input",
    }))
  }, [setInput])

  return (
    <div className="content">
      {input.wallet && wallets.length > 1 && (
        <div className="btc-usd-switch">
          <div
            onClick={() => toggleWallet()}
            className={`button btc ${input.wallet.walletCurrency === "BTC" && "active"}`}
          >
            BTC
          </div>
          <div
            onClick={() => toggleWallet()}
            className={`button usd ${input.wallet.walletCurrency === "USD" && "active"}`}
          >
            USD
          </div>
        </div>
      )}

      <div className="action-container center-display invoice-generator">
        {InvoiceGeneratorDisplay()}
      </div>

      <div className="action-button center-display">
        <div className="receive-action" onClick={showInputView}>
          {translate("Set amount/note")}
        </div>

        {input.wallet?.walletCurrency === "BTC" && (
          <div className="receive-action" onClick={togglePaymentLayer}>
            {input.layer === "lightning"
              ? translate("Use a Bitcoin on-chain adddress")
              : translate("Use a Lightning invoice")}
          </div>
        )}
      </div>

      <div className="action-button center-display">
        <Link to="/">{translate("Cancel")}</Link>
      </div>
    </div>
  )
}

export default InvoiceOverview
