import { useEffect } from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import Image from "react-bootstrap/Image"
import { gql, useMutation } from "@apollo/client"

import { getOS, appStoreLink, playStoreLink } from "./downloadApp"
import Invoice from "./invoice"

type OperationError = {
  message: string
}

type LnInvoiceObject = {
  paymentRequest: string
}

const LN_NOAMOUNT_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT = gql`
  mutation lnNoAmountInvoiceCreateOnBehalfOfRecipient($walletName: WalletName!) {
    mutationData: lnNoAmountInvoiceCreateOnBehalfOfRecipient(
      input: { recipient: $walletName }
    ) {
      errors {
        message
      }
      invoice {
        paymentRequest
      }
    }
  }
`

function uiErrorMessage(errorMessage: string) {
  switch (errorMessage) {
    case "CouldNotFindError":
      return "User not found"
    default:
      console.error(errorMessage)
      return "Something went wrong"
  }
}

export default function ReceiveNoAmount({ username }: { username: string }) {
  const [createInvoice, { loading, error, data }] = useMutation<{
    mutationData: {
      errors: OperationError[]
      invoice?: LnInvoiceObject
    }
  }>(LN_NOAMOUNT_INVOICE_CREATE_ON_BEHALF_OF_RECIPIENT)

  useEffect(() => {
    createInvoice({
      variables: { walletName: username },
    })
  }, [createInvoice, username])

  if (error) {
    console.error(error)
  }

  let errorMessage, invoice

  if (data) {
    const invoiceData = data.mutationData

    if (invoiceData.errors?.length > 0) {
      errorMessage = invoiceData.errors[0].message
    }

    invoice = invoiceData.invoice
  }

  const os = getOS()

  return (
    <Container fluid>
      {os === undefined && <br />}
      <Row className="justify-content-md-center">
        <Col md="auto" style={{ padding: 0 }}>
          <Card className="text-center">
            <Card.Header>Pay {username}</Card.Header>

            {errorMessage && <div className="error">{uiErrorMessage(errorMessage)}</div>}

            {loading && !error && (
              <div>
                {" "}
                <br />
                Loading...
              </div>
            )}

            {invoice && <Invoice paymentRequest={invoice.paymentRequest} />}

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
