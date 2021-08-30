import lightningPayReq from "bolt11"
import { useEffect, useState } from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import Image from "react-bootstrap/Image"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { QRCode } from "react-qrcode-logo"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { getOS, appStoreLink, playStoreLink } from "./downloadApp"
import copy from "copy-to-clipboard"
import Lottie from "react-lottie"
import animationData from "./successAnimation.json"

const UPDATE_PENDING_INVOICE = gql`
  query noauthUpdatePendingInvoice($hash: String!, $username: String!) {
    noauthUpdatePendingInvoice(username: $username, hash: $hash)
  }
`

const GENERATE_PUBLIC_INVOICE = gql`
  mutation noauthAddInvoice($username: String!) {
    noauthAddInvoice(username: $username)
  }
`

function Receive({ username }: { username: string }) {
  const [invoice, setInvoice] = useState("")
  const [invoicePaid, setInvoicePaid] = useState(false)
  const [os, setOS] = useState<null | undefined | string>(null) // TODO: simplify type
  const [showCopied, setShowCopied] = useState(false)

  const [generatePublicInvoice, { loading: invoiceLoading, error }] = useMutation(
    GENERATE_PUBLIC_INVOICE,
    {
      onCompleted({ noauthAddInvoice: invoice }) {
        setInvoice(invoice)
        updateInvoiceStatus(invoice)
      },
      onError(error) {
        console.error(error.message)
      },
    },
  )

  const [updatePendingInvoice, { stopPolling }] = useLazyQuery(UPDATE_PENDING_INVOICE, {
    onCompleted({ noauthUpdatePendingInvoice: invoicePaid }) {
      console.log({ invoicePaid, stopPolling })
      setInvoicePaid(invoicePaid)
      if (invoicePaid) {
        // @ts-expect-error: this is going aawy soon
        stopPolling()
      }
    },
    onError(error) {
      console.log({ error })
    },
    pollInterval: 3500,
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    generatePublicInvoice({ variables: { username } })
    setOS(getOS())
  }, [generatePublicInvoice, username])

  const updateInvoiceStatus = async (invoice: string) => {
    const decoded = lightningPayReq.decode(invoice)
    const [{ data: hash }] = decoded.tags.filter(
      (item) => item.tagName === "payment_hash",
    )
    updatePendingInvoice({ variables: { username, hash } })
  }

  const copyInvoice = () => {
    copy(invoice)
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 3000)
  }

  return (
    <Container fluid>
      {os === undefined && <br />}
      <Row className="justify-content-md-center">
        <Col md="auto" style={{ padding: 0 }}>
          <Card className="text-center">
            <Card.Header>Pay {username}</Card.Header>
            {error?.message === "User not found" && (
              <div>
                {" "}
                <br /> User not found{" "}
              </div>
            )}
            {(invoiceLoading || !invoice) && !error && (
              <div>
                {" "}
                <br />
                Loading...
              </div>
            )}
            {invoicePaid && (
              <div>
                <Lottie
                  options={{ animationData: animationData, loop: false }}
                  height="150"
                  width="150"
                ></Lottie>
              </div>
            )}
            {!invoiceLoading && !invoicePaid && !error && (
              <Card.Body style={{ paddingBottom: "0", paddingTop: "5px" }}>
                <small>Scan using a lightning enabled wallet</small>

                <OverlayTrigger
                  show={showCopied}
                  placement="top"
                  overlay={<Tooltip id="copy">Copied!</Tooltip>}
                >
                  <div onClick={copyInvoice}>
                    <QRCode
                      value={`${invoice}`}
                      size={320}
                      logoImage={process.env.PUBLIC_URL + "/BBQRLogo.png"}
                      logoWidth={100}
                    />
                  </div>
                </OverlayTrigger>
                <p>Click on the QR code to copy</p>
                <p>Waiting for payment confirmation...</p>
              </Card.Body>
            )}

            <Card.Body>
              {os === "android" && (
                <a href={playStoreLink}>
                  <Image
                    src={process.env.PUBLIC_URL + "/google-play-badge.png"}
                    height="40px"
                    rounded
                  />
                </a>
              )}
              {os === "ios" && (
                <a href={playStoreLink}>
                  <Image
                    src={process.env.PUBLIC_URL + "/apple-app-store.png"}
                    height="40px"
                    rounded
                  />
                </a>
              )}
              {os === undefined && (
                <div>
                  <a href={appStoreLink}>
                    <Image
                      src={process.env.PUBLIC_URL + "/apple-app-store.png"}
                      height="45px"
                      rounded
                    />
                  </a>
                  &nbsp;
                  <a href={playStoreLink}>
                    <Image
                      src={process.env.PUBLIC_URL + "/google-play-badge.png"}
                      height="45px"
                      rounded
                    />
                  </a>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              Powered by <Card.Link href="https://galoy.io">Galoy </Card.Link>
              <br />
              <Card.Link href={window.location.origin}>Open a channel with us</Card.Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <br />
    </Container>
  )
}

export default Receive
