import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import { useQueryParams } from "hookrouter"
import Image from "react-bootstrap/Image"

import { getOS, appStoreLink, playStoreLink } from "./downloadApp"
import ReceiveAmount from "./receiveAmount"
import ReceiveNoAmount from "./receiveNoAmount"
import { gql, useQuery } from "@apollo/client"
import { currencyEnum } from "../enums/currency"
import AmountInput from "./atoms/amountInput"
import { useState } from "react"

const USER_WALLET_ID = gql`
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

export default function Receive({ username }: { username: string }) {
  const queryResult = useQueryParams()
  const amountParam = queryResult[0]?.amount
  const [amount, setAmount] = useState(amountParam)
  const currency = queryResult[0]?.currency?.toLowerCase()

  const { error, loading, data } = useQuery(USER_WALLET_ID, {
    variables: {
      username,
    },
  })

  const os = getOS()

  if (error) return <div className="error">{error.message}</div>
  if (loading) return <div className="loading">Loading...</div>
  if (!data) return null

  const { userDefaultWalletId } = data

  const callbackAmount = (amount: string) => setAmount(amount)

  return (
    <Container fluid>
      {os === undefined && <br />}
      <Row className="justify-content-md-center">
        <Col md="auto" style={{ padding: 0 }}>
          <Card className="text-center">
            <Card.Header>Pay {username}</Card.Header>

            <AmountInput callbackAmount={callbackAmount} />

            {amount && currency ? (
              <ReceiveAmount
                userWalletId={userDefaultWalletId}
                amount={amount}
                currency={currency}
              />
            ) : (
              <ReceiveNoAmount userWalletId={userDefaultWalletId} />
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
