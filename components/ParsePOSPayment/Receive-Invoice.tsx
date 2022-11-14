import copy from "copy-to-clipboard"
import { useRouter } from "next/router"
import React from "react"
import Image from "react-bootstrap/Image"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { QRCode } from "react-qrcode-logo"
import { useTimer } from "react-timer-hook"
import { useScreenshot } from "use-react-screenshot"
import { AmountUnit } from "."

import { URL_HOST_DOMAIN, USD_INVOICE_EXPIRE_INTERVAL } from "../../config/config"
import useCreateInvoice from "../../hooks/use-Create-Invoice"
import { LnInvoiceObject } from "../../lib/graphql/index.types.d"
import useSatPrice from "../../lib/use-sat-price"
import { ACTION_TYPE } from "../../pages/_reducer"
import PaymentOutcome from "../PaymentOutcome"
import { Share } from "../Share"
import styles from "./parse-payment.module.css"

interface Props {
  recipientWalletCurrency?: string
  walletId: string | undefined
  state: React.ComponentState
  dispatch: React.Dispatch<ACTION_TYPE>
}

const USD_MAX_INVOICE_TIME = "5.00"

function ReceiveInvoice({ recipientWalletCurrency, walletId, state, dispatch }: Props) {
  const { username, amount, currency, unit, sats, memo } = useRouter().query
  const { usdToSats } = useSatPrice()

  const [copied, setCopied] = React.useState<boolean>(false)
  const [shareState, setShareState] = React.useState<"not-set">()
  const [image, takeScreenShot] = useScreenshot()

  const qrImageRef = React.useRef(null)
  const getImage = () => takeScreenShot(qrImageRef.current)

  const shareUrl =
    !amount && !unit && !memo
      ? `https://${URL_HOST_DOMAIN}/${username}?amount=${
          state.currentAmount
        }&sats=${usdToSats(
          state.currentAmount,
        ).toFixed()}&currency=${recipientWalletCurrency}&unit=SAT&memo=""`
      : window.location.href

  const shareData = {
    title: `Pay ${username}`,
    text: `Use the link embedded below to pay ${username} some sats. Powered by: https://galoy.io`,
    url: shareUrl,
  }

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

  const { createInvoice, data, errorsMessage, error, loading, invoiceStatus } =
    useCreateInvoice({
      recipientWalletCurrency,
    })

  const paymentAmount = React.useMemo(() => {
    if (amount === "0.00" || isNaN(Number(amount))) {
      if (sats && unit === AmountUnit.Sat) {
        return sats
      } else if (Number(state.currentAmount) > 0) {
        return usdToSats(Number(state.currentAmount)).toFixed(2)
      }
    }

    if (sats && unit === AmountUnit.Sat) {
      return sats
    }

    return usdToSats(Number(amount)).toFixed(2)
  }, [amount, unit, sats, usdToSats, state.currentAmount])

  React.useEffect(() => {
    if (!walletId || !Number(paymentAmount)) return

    createInvoice({
      variables: {
        input: {
          recipientWalletId: walletId,
          amount: Number(paymentAmount),
          ...(memo ? { memo: memo.toString() } : {}),
        },
      },
    })
  }, [amount, walletId, paymentAmount, createInvoice, memo])

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

  if (loading || invoiceStatus === "loading" || !invoice?.paymentRequest) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
      </div>
    )
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
        {error && <p className={styles.error}>{errorString}</p>}

        {data && (
          <>
            <div
              ref={qrImageRef}
              aria-labelledby="QR code of lightning payment"
              onClick={copyInvoice}
            >
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
                <button title="Copy invoice" onClick={copyInvoice}>
                  <Image
                    src="/icons/copy-icon.svg"
                    alt="copy icon"
                    width="18px"
                    height="18px"
                  />
                  {copied ? "Copied" : "Copy"}
                </button>
              </OverlayTrigger>

              <Share
                shareData={shareData}
                getImage={getImage}
                image={image}
                shareState={shareState}
              >
                <span
                  title="Share lightning invoice"
                  className={styles.share_btn}
                  onClick={() => setShareState("not-set")}
                >
                  <Image
                    src="/icons/share-icon.svg"
                    alt="share-icon"
                    width="18px"
                    height="18px"
                  />
                  Share
                </span>
              </Share>
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
