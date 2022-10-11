import { useCallback, useEffect } from "react"

import { useMutation } from "@galoymoney/client"

import useMainQuery from "hooks/use-main-query"
import { translate } from "store/index"

import InvoiceGenerator from "components/receive/invoice-generator"
import Link, { ButtonLink } from "components/link"
import { ReceiveScreenInput } from "components/pages/receive"

type FCT = React.FC<{
  input: ReceiveScreenInput
  setInput: React.Dispatch<React.SetStateAction<ReceiveScreenInput>>
}>

const InvoiceOverview: FCT = ({ input, setInput }) => {
  const { btcWalletId } = useMainQuery()

  const [generateBtcAddress, { loading, errorsMessage, data }] =
    useMutation.onChainAddressCurrent()

  useEffect(() => {
    if (input.layer === "onchain" && btcWalletId) {
      // Layer switched to onchain, generate a btc address
      generateBtcAddress({
        variables: {
          input: { walletId: btcWalletId },
        },
      })
    }
  }, [btcWalletId, generateBtcAddress, input.layer])

  if (errorsMessage) {
    console.debug("[BTC address error]:", errorsMessage)
    throw new Error("Unable to get BTC address for wallet")
  }

  const btcAddress = data?.onChainAddressCurrent?.address ?? undefined

  const regenerateInvoice = useCallback(() => {
    setInput((currInput) => ({ ...currInput, satAmount: NaN, usdAmount: NaN }))
  }, [setInput])

  const InvoiceGeneratorDisplay = () => {
    if (!btcWalletId) {
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
          btcWalletId={btcWalletId}
          btcAddress={btcAddress}
          regenerate={regenerateInvoice}
          amount={input.amount as number}
          currency={input.currency}
          memo={input.memo as string}
          satAmount={input.satAmount as number}
          usdAmount={input.usdAmount as number}
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
      <div className="action-container center-display invoice-generator">
        {InvoiceGeneratorDisplay()}
      </div>

      <div className="action-button center-display">
        <div className="receive-action" onClick={showInputView}>
          Set amount/note
        </div>

        <div className="receive-action" onClick={togglePaymentLayer}>
          {input.layer === "lightning"
            ? translate("Use a Bitcoin on-chain adddress")
            : translate("Use a Lightning invoice")}
        </div>
      </div>

      <div className="action-button center-display">
        <Link to="/">{translate("Cancel")}</Link>
      </div>
    </div>
  )
}

export default InvoiceOverview
