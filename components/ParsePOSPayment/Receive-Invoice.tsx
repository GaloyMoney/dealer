import copy from "copy-to-clipboard"
import { useRouter } from "next/router"
import React from "react"
import Image from "react-bootstrap/Image"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { QRCode } from "react-qrcode-logo"
import { useTimer } from "react-timer-hook"

import { USD_INVOICE_EXPIRE_INTERVAL } from "../../config/config"
import useCreateInvoice from "../../hooks/use-Create-Invoice"
import { LnInvoiceObject } from "../../lib/graphql/index.types.d"
import useSatPrice from "../../lib/use-sat-price"
import { ACTION_TYPE } from "../../pages/merchant/_reducer"
import PaymentOutcome from "../PaymentOutcome"
import styles from "./parse-payment.module.css"

interface Props {
  recipientWalletCurrency?: string
  walletId: string | undefined
  state: React.ComponentState
  dispatch: React.Dispatch<ACTION_TYPE>
}

const USD_MAX_INVOICE_TIME = "5.00"

function ReceiveInvoice({ recipientWalletCurrency, walletId, dispatch }: Props) {
  const { usdToSats } = useSatPrice()
  const { amount, currency } = useRouter().query
  const [copied, setCopied] = React.useState<boolean>(false)
  const timerRef = React.useRef<Date>()

  timerRef.current = new Date()
  if (currency === "USD") {
    timerRef.current.setSeconds(
      timerRef.current.getSeconds() + USD_INVOICE_EXPIRE_INTERVAL,
    ) // default to five mins for USD invoice
  }
  const expiryTimestamp = timerRef.current
  const { seconds, minutes } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called on USD"),
  })

  const { createInvoice, data, errorsMessage, error, loading } = useCreateInvoice({
    recipientWalletCurrency,
  })

  const paymentAmount = React.useMemo(() => {
    if (currency === "USD") {
      return amount
    }

    return usdToSats(Number(amount)).toFixed()
  }, [amount, currency, usdToSats])

  React.useEffect(() => {
    if (
      paymentAmount === "0.00" ||
      paymentAmount == undefined ||
      isNaN(Number(paymentAmount)) ||
      walletId == undefined
    ) {
      return
    }
    const amount = Number(paymentAmount)
    createInvoice({
      variables: {
        input: { recipientWalletId: walletId, amount },
      },
    })
  }, [paymentAmount, walletId, createInvoice])

  const errorString: string | null = errorsMessage || null
  let invoice: LnInvoiceObject | undefined

  if (data) {
    if ("lnInvoiceCreateOnBehalfOfRecipient" in data) {
      const { lnInvoiceCreateOnBehalfOfRecipient: invoiceData } = data
      if (invoiceData.invoice) {
        invoice = invoiceData.invoice
      }
    }
    if ("lnUsdInvoiceCreateOnBehalfOfRecipient" in data) {
      const { lnUsdInvoiceCreateOnBehalfOfRecipient: invoiceData } = data
      if (invoiceData.invoice) {
        invoice = invoiceData.invoice
      }
    }
  }

  if (!invoice?.paymentRequest) {
    return null
  }

  const copyInvoice = () => {
    if (!invoice?.paymentRequest) {
      return
    }
    copy(invoice.paymentRequest)
    setCopied(!copied)
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <div className={styles.invoice_container}>
      {recipientWalletCurrency === "USD" && (
        <div className={styles.timer_container}>
          <p>{`${minutes}:${seconds}`}</p>
          <div className={styles.timer}>
            <span></span>
          </div>
          <p>{USD_MAX_INVOICE_TIME}</p>
        </div>
      )}
      <div>
        {loading ||
          (invoice?.paymentRequest == undefined && (
            <p className={styles.loading}>Generating invoice</p>
          ))}

        {error && <p className={styles.error}>{errorString}</p>}

        {data && (
          <>
            <div aria-labelledby="QR code of lightning payment" onClick={copyInvoice}>
              <QRCode
                value={invoice?.paymentRequest}
                size={320}
                logoImage="/BBW-QRLOGO.png"
                logoWidth={100}
              />
            </div>
            <div className={styles.qr_clipboard}>
              <OverlayTrigger
                show={copied}
                placement="right"
                overlay={<Tooltip id="copy">Copied!</Tooltip>}
              >
                <button onClick={copyInvoice}>
                  <Image
                    src="/icons/copy-icon.svg"
                    alt="copy icon"
                    width="18px"
                    height="18px"
                  />
                  {copied ? "Copied" : "Copy"}
                </button>
              </OverlayTrigger>
              <button>
                <Image
                  src="/icons/share-icon.svg"
                  alt="share-icon"
                  width="18px"
                  height="18px"
                />
                Share
              </button>
            </div>
          </>
        )}
      </div>
      <PaymentOutcome
        paymentRequest={invoice?.paymentRequest}
        paymentAmount={paymentAmount}
        dispatch={dispatch}
      />
    </div>
  )
}

export default ReceiveInvoice
