import { useState } from "react"
import { QRCode } from "react-qrcode-logo"
import copy from "copy-to-clipboard"

import { useMyUpdates } from "store/use-my-updates"
import { translate } from "translate"
import SuccessCheckmark from "./sucess-checkmark"

type Props = {
  invoice: GraphQL.LnInvoice | GraphQL.LnNoAmountInvoice
  onPaymentSuccess?: () => void
}

const Invoice = ({ invoice, onPaymentSuccess }: Props) => {
  const { lnUpdate } = useMyUpdates()
  const [showCopied, setShowCopied] = useState(false)

  const copyInvoice = () => {
    copy(invoice.paymentRequest)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 3000)
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
          <div className="invoice-payment-request">{paymentRequestLine}</div>
        </div>
      </div>
      <div className="click-or-scan">{translate("Click QR code to copy")}</div>
      <p>{translate("Waiting for payment confirmation...")}</p>
      {showCopied && (
        <div className="invoice-copied">
          {translate("Invoice has been copied to the clipboard")}
        </div>
      )}
    </div>
  )
}

export default Invoice
