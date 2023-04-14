import copy from "copy-to-clipboard"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useCallback } from "react"
import { Button, Modal } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { QRCode } from "react-qrcode-logo"
import { useTimer } from "react-timer-hook"
import { useScreenshot } from "use-react-screenshot"

import { URL_HOST_DOMAIN, USD_INVOICE_EXPIRE_INTERVAL } from "../../config/config"
import useCreateInvoice from "../../hooks/use-Create-Invoice"
import { apkLink, appStoreLink, getOS, playStoreLink } from "../../lib/download"
import { LnInvoiceObject } from "../../lib/graphql/index.types.d"
import useSatPrice from "../../lib/use-sat-price"
import { ACTION_TYPE } from "../../pages/_reducer"
import PaymentOutcome from "../PaymentOutcome"
import { Share } from "../Share"
import styles from "./parse-payment.module.css"
import { safeAmount } from "../../utils/utils"

interface Props {
  recipientWalletCurrency?: string
  walletId: string | undefined
  state: React.ComponentState
  dispatch: React.Dispatch<ACTION_TYPE>
}

const USD_MAX_INVOICE_TIME = "5.00"

function ReceiveInvoice({ recipientWalletCurrency, walletId, state, dispatch }: Props) {
  const OS = getOS()
  const deviceDetails = window.navigator.userAgent
  const router = useRouter()
  const { username, amount, unit, sats, memo } = router.query

  const { usdToSats, satsToUsd } = useSatPrice()

  const [expiredInvoiceError, setExpiredInvoiceError] = React.useState<string>("")
  const [copied, setCopied] = React.useState<boolean>(false)
  const [shareState, setShareState] = React.useState<"not-set">()
  const [image, takeScreenShot] = useScreenshot()
  const [openModal, setOpenModal] = React.useState<boolean>(false)

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
  if (recipientWalletCurrency === "USD") {
    timerRef.current.setSeconds(
      timerRef.current.getSeconds() + USD_INVOICE_EXPIRE_INTERVAL,
    ) // default to five mins for USD invoice
  }
  const expiryTimestamp = timerRef.current
  const { seconds, minutes } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      if (recipientWalletCurrency === "BTC") return
      setExpiredInvoiceError("Invoice has expired. Generate a new invoice!")
    },
  })

  const { createInvoice, data, errorsMessage, loading, invoiceStatus } = useCreateInvoice(
    {
      recipientWalletCurrency,
    },
  )

  const paymentAmount = React.useMemo(() => {
    if (!router.query.sats || typeof router.query.sats !== "string") {
      alert("No sats amount provided")
      return
    }
    let amt = safeAmount(router.query.sats)
    if (recipientWalletCurrency === "USD") {
      const usdAmount = satsToUsd(Number(amt))
      if (isNaN(usdAmount)) return
      const cents = parseFloat(usdAmount.toFixed(2)) * 100
      amt = Number(cents.toFixed())
    }
    if (amt === null) return
    return safeAmount(amt).toString()
  }, [
    amount,
    unit,
    sats,
    usdToSats,
    satsToUsd,
    state.currentAmount,
    recipientWalletCurrency,
  ])

  React.useEffect(() => {
    if (!walletId || !Number(paymentAmount)) return

    let amt = paymentAmount
    if (recipientWalletCurrency === "USD") {
      if (!router.query.sats || typeof router.query.sats !== "string") {
        alert("No sats amount provided")
        return
      } else {
        const usdAmount = satsToUsd(Number(router.query.sats))
        if (isNaN(usdAmount)) return
        const cents = parseFloat(usdAmount.toFixed(2)) * 100
        amt = cents.toFixed()
        if (cents < 0.01) {
          setExpiredInvoiceError(
            `Amount is too small. Must be larger than ${usdToSats(0.01).toFixed()} sats`,
          )
          return
        }
      }
    }
    if (amt === null) return

    createInvoice({
      variables: {
        input: {
          recipientWalletId: walletId,
          amount: Number(amt),
          ...(memo ? { memo: memo.toString() } : {}),
        },
      },
    })
  }, [
    amount,
    walletId,
    paymentAmount,
    createInvoice,
    memo,
    recipientWalletCurrency === "USD" ? satsToUsd : null,
  ])

  const isMobileDevice = useCallback(() => {
    const mobileDevice = /android|iPhone|iPod|kindle|HMSCore|windows phone|ipad/i
    if (window.navigator.maxTouchPoints > 1 || mobileDevice.test(deviceDetails)) {
      return true
    }
    return false
  }, [deviceDetails])

  const isDesktopType = useCallback(() => {
    const desktopType = /Macintosh|linux|Windows|Ubuntu/i
    const type = deviceDetails.match(desktopType)
    return type?.[0]
  }, [deviceDetails])

  const fallbackUrl =
    OS === "ios" ? appStoreLink : OS === "android" ? playStoreLink : apkLink

  const handleLinkClick = () => {
    if (isDesktopType() === "Macintosh") {
      return window.open(appStoreLink, "_blank")
    }
    return window.open(playStoreLink, "_blank")
  }

  React.useEffect(() => {
    isMobileDevice()
    isDesktopType()
  }, [isDesktopType, isMobileDevice])

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

  if ((errorString && !loading) || expiredInvoiceError) {
    const invalidInvoiceError =
      recipientWalletCurrency === "USD" && Number(amount?.toString()) <= 0
        ? `Enter an amount greater than 1 cent (${usdToSats(0.01).toFixed()} sats)`
        : expiredInvoiceError ?? null
    return (
      <div className={styles.error}>
        <p>{errorString}</p>
        <p>{invalidInvoiceError}</p>
      </div>
    )
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
        {data ? (
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
            <Button
              className={styles.pay_with_wallet}
              onClick={() => {
                !isMobileDevice() && setOpenModal(true)
              }}
            >
              {isMobileDevice() ? (
                <Link href={isMobileDevice() ? fallbackUrl : ""}>Pay in Wallet</Link>
              ) : (
                "Pay in wallet"
              )}
            </Button>
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
        ) : null}
      </div>
      <PaymentOutcome
        paymentRequest={invoice?.paymentRequest}
        paymentAmount={paymentAmount}
        dispatch={dispatch}
      />
      {openModal && (
        <Modal
          show={openModal}
          onHide={() => setOpenModal(false)}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header className={styles.modal_header} closeButton>
            You can pay with
          </Modal.Header>
          <Modal.Body>
            <div className={styles.modal_item_wrapper}>
              <Image
                src="/BBW-QRLOGO.png"
                alt="bitcoin beach wallet image"
                className={styles.modal_item}
                style={{ cursor: "pointer" }}
                onClick={handleLinkClick}
              />
              <Image
                src="/pheonix-logo.png"
                alt="pheonix wallet logo"
                className={styles.modal_item}
              />
              <Image
                src="/wallet-of-satoshi-logo.png"
                alt="wallet of satoshi logo"
                className={styles.modal_item}
              />
              <Image
                className={styles.modal_item}
                src="/blue-wallet.png"
                alt="blue wallet logo"
              />
              <Image
                className={styles.modal_item}
                src="/breez-logo.png"
                alt="breez beach wallet logo"
              />
              <Image
                className={styles.modal_item}
                src="/muun-logo.png"
                alt="muun wallet logo"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className={styles.use_bbw_button} onClick={handleLinkClick}>
              Use Bitcoin Beach wallet
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default ReceiveInvoice
