import { useState } from "react"
import { gql, useSubscription } from "@apollo/client"
import Card from "react-bootstrap/Card"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { QRCode } from "react-qrcode-logo"
import copy from "copy-to-clipboard"
import Lottie from "react-lottie"

import animationData from "./success-animation.json"

type OperationError = {
  message: string
}

const LN_INVOICE_PAYMENT_STATUS = gql`
  subscription lnInvoicePaymentStatus($input: LnInvoicePaymentStatusInput!) {
    lnInvoicePaymentStatus(input: $input) {
      errors {
        message
      }
      status
    }
  }
`

export default function Invoice({
  paymentRequest,
  onPaymentSuccess,
}: {
  paymentRequest: string
  onPaymentSuccess?: () => void
}) {
  const [showCopied, setShowCopied] = useState(false)

  const { loading, error, data } = useSubscription<{
    lnInvoicePaymentStatus: {
      errors: OperationError[]
      status?: string
    }
  }>(LN_INVOICE_PAYMENT_STATUS, {
    variables: {
      input: {
        paymentRequest,
      },
    },
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.lnInvoicePaymentStatus?.status === "PAID") {
        onPaymentSuccess && onPaymentSuccess()
      }
    },
  })

  const copyInvoice = () => {
    copy(paymentRequest)
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 3000)
  }

  if (error) {
    console.error(error)
    return <div className="error">{error.message}</div>
  }

  if (loading) {
    return (
      <Card.Body className="qr-code-container">
        <small>Scan using a Lightning-supported wallet</small>

        <OverlayTrigger
          show={showCopied}
          placement="top"
          overlay={<Tooltip id="copy">Copied!</Tooltip>}
        >
          <div onClick={copyInvoice}>
            <QRCode
              value={`${paymentRequest}`}
              size={320}
              logoImage="/BBQRLogo.png"
              logoWidth={100}
            />
          </div>
        </OverlayTrigger>
        <p>
          Click on the QR code to copy <br /> or{" "}
          <a href={`lightning:${paymentRequest}`}>Open with wallet</a>
        </p>
        <p>Waiting for payment confirmation...</p>
      </Card.Body>
    )
  }

  if (data) {
    const { errors, status } = data.lnInvoicePaymentStatus
    if (errors.length > 0) {
      console.error(errors)
      return <div className="error">{errors[0].message}</div>
    }
    if (status === "PAID") {
      return (
        <div>
          <Lottie
            options={{ animationData: animationData, loop: false }}
            height="150"
            width="150"
          ></Lottie>
        </div>
      )
    }
  }

  return <div className="error">Something went wrong</div>
}
