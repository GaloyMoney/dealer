import React, { useEffect, useState } from 'react';
import Figure from 'react-bootstrap/Figure'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button'
import { QRCode } from 'react-qrcode-logo'
import Header from './header.js'
import { gql, useMutation } from '@apollo/client';
import { getOS, appStoreLink, playStoreLink } from './downloadApp.js'
import { CopyToClipboard } from 'react-copy-to-clipboard';

const UPDATE_PENDING_INVOICE = gql`
      mutation PublicInvoice($hash: String!, $username: String!) {
        publicInvoice(username: $username) {
          updatePendingInvoice(hash: $hash)
        }
      }
    `

const GENERATE_PUBLIC_INVOICE = gql`
      mutation publicInvoice($username: String!) {
        publicInvoice(username: $username) {
          addInvoice
        }
      }
    `

function Receive({ username }) {

  const [invoice, setInvoice] = useState(0)
  const [invoicePaid, setInvoicePaid] = useState(false)
  const [os, setOS] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  const [generatePublicInvoice, { loading: invoiceLoading, error }] = useMutation(GENERATE_PUBLIC_INVOICE, {
    onCompleted({ publicInvoice: { addInvoice } }) {
      setInvoice(addInvoice)
    },
    onError(error) {
      console.error(error.message)
    }
  })

  useEffect(() => {
    generatePublicInvoice({ variables: { username } })
    setOS(getOS())
  }, [])

  const [updatePendingInvoice, { loading: invoiceUpdating }] = useMutation(UPDATE_PENDING_INVOICE, {
    onCompleted({ publicInvoice: { updatePendingInvoice: invoicePaid } }) {
      setInvoicePaid(invoicePaid)
    }
  })

  const checkPayment = async () => {
    let decoded = window.lightningPayReq.decode(invoice)
    let [{ data: hash }] = decoded.tags.filter(item => item.tagName === "payment_hash")
    updatePendingInvoice({ variables: { username, hash } })
  }

  return (
    <div>
      <Header />
      <Container fluid >
        {os === undefined && <br />}
        <Row className="justify-content-md-center">
          <Col md="auto" style={{ padding: 0 }}>
            <Card className="text-center">
              <Card.Header>
                Pay {username}
              </Card.Header>
              {error?.message === "User not found" && <div> <br /> User not found </div>}
              {(invoiceLoading || !invoice) && !error && <div> <br />Loading...</div>}
              {invoicePaid &&
                <div>
                  <br />
                  <Figure>
                    <Figure.Image src={process.env.PUBLIC_URL + '/confetti.svg'} width={150} height={150} />
                  </Figure>
                  <br />
									Payment received!
									</div>
              }
              {!invoiceLoading && !invoicePaid && !error && <Card.Body style={{ paddingBottom: '0' }}>
                <small>Scan using a lightning enabled wallet</small>
                <Card.Text style={{ marginBottom: 0, marginTop: "5px" }}>
                  <CopyToClipboard text={invoice}>
                  <span>
                    <QRCode value={`${invoice}`} size={320} logoImage={process.env.PUBLIC_URL + '/BBQRLogo.png'} logoWidth={100} />
                    </span>
                  </CopyToClipboard>
                </Card.Text>
                <Button size="sm" onClick={() => setIsCopied(true)}>{isCopied ? "Copied" : "Copy invoice"}</Button>
                  &nbsp;
                <Button size="sm" disabled={invoiceUpdating} onClick={checkPayment}>{invoiceUpdating ? 'Waiting...' : 'Check payment'}</Button>
              </Card.Body>}

              <Card.Body>
                <br />
                {os === "android" && <a href={playStoreLink}>
                  <Image src={process.env.PUBLIC_URL + '/google-play-badge.png'} height="40px" rounded />
                </a>}
                {os === "ios" && <a href={playStoreLink}>
                  <Image src={process.env.PUBLIC_URL + '/apple-app-store.png'} height="40px" rounded />
                </a>}
                {os === undefined && <div>
                  <a href={appStoreLink}>
                    <Image src={process.env.PUBLIC_URL + '/apple-app-store.png'} height="45px" rounded />
                  </a>&nbsp;
                  <a href={playStoreLink}>
                    <Image src={process.env.PUBLIC_URL + '/google-play-badge.png'} height="45px" rounded />
                  </a>
                </div>}
              </Card.Body>
              <Card.Footer className="text-muted">
                Powered by <Card.Link href="https://try.galoy.io">Galoy </Card.Link>
                <br /><Card.Link href={window.location.origin}>Open a channel with us</Card.Link>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <br />
      </Container>

    </div>
  )
}

export default Receive