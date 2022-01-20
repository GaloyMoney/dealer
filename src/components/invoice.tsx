import { useState } from "react"
import { QRCode } from "react-qrcode-logo"
import copy from "copy-to-clipboard"

import { useMyUpdates } from "store/use-my-updates"
import { translate } from "translate"
import SuccessCheckmark from "./sucess-checkmark"
import { satsToBTC, useAppDispatcher } from "store"
import { GaloyGQL } from "@galoymoney/client"

type LightningInvoiceProps = {
  invoice: GaloyGQL.LnInvoice | GaloyGQL.LnNoAmountInvoice
  onPaymentSuccess?: () => void
}

const LightningInvoice = ({ invoice, onPaymentSuccess }: LightningInvoiceProps) => {
  const dispatch = useAppDispatcher()
  const { lnUpdate } = useMyUpdates()
  const [showCopied, setShowCopied] = useState(false)

  const copyInvoice = () => {
    copy(invoice.paymentRequest)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 3000)
  }

  const resetReceiveScreen = () => {
    dispatch({ type: "reset-current-screen" })
  }

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

  if (invoicePaid) {
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }

    return (
      <div className="invoice-paid">
        <SuccessCheckmark />
        <button onClick={resetReceiveScreen}>Receive another payment</button>
      </div>
    )
  }

  const { paymentRequest } = invoice

  const paymentRequestLine =
    paymentRequest.substring(0, 21) +
    "..." +
    paymentRequest.substring(paymentRequest.length - 21)

  return (
    <div className="qr-code-container">
      <div>
        <div onClick={copyInvoice}>
          <QRCode
            value={`${invoice.paymentRequest}`}
            size={320}
            logoImage="/images/qr-logo.png"
            logoWidth={100}
          />
          <div className="payment-destination-code">{paymentRequestLine}</div>
        </div>
      </div>
      <div className="copy-message">{translate("Click QR code to copy")}</div>
      <p>{translate("Waiting for payment confirmation...")}</p>
      {showCopied && (
        <div className="invoice-copied">
          {translate("Invoice has been copied to the clipboard")}
        </div>
      )}
    </div>
  )
}

type OnChainInvoiceProps = {
  btcAddress?: GaloyGQL.Scalars["OnChainAddress"]
  satAmount?: number
  memo?: string
  onPaymentSuccess?: () => void
}

const OnChainInvoice = ({ btcAddress, satAmount, memo }: OnChainInvoiceProps) => {
  const [showCopied, setShowCopied] = useState(false)

  const params = new URLSearchParams()
  if (satAmount) {
    params.append("amount", `${satsToBTC(satAmount)}`)
  }
  if (memo) {
    params.append("message", encodeURI(memo))
  }

  const btcAddressParams = params.toString() ? "?" + params.toString() : ""

  const copyInvoice = () => {
    copy(btcAddress + btcAddressParams)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 3000)
  }

  return (
    <div className="qr-code-container">
      <div onClick={copyInvoice}>
        <QRCode
          value={btcAddress + btcAddressParams}
          size={320}
          logoImage="/images/qr-logo.png"
          logoWidth={100}
        />
        <div className="payment-destination-code">{btcAddress}</div>
      </div>
      <div className="copy-message">{translate("Click QR code to copy")}</div>
      {showCopied && (
        <div className="invoice-copied">
          {translate("Address has been copied to the clipboard")}
        </div>
      )}
    </div>
  )
}

export { LightningInvoice, OnChainInvoice }
