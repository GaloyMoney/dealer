import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container"
import originalUrl from "original-url"
import ReactToPrint from "react-to-print"
import { bech32 } from "bech32"
import { QRCode } from "react-qrcode-logo"
import { useRef, useState } from "react"

export async function getServerSideProps({
  req,
  params: { username },
}: {
  req: unknown
  params: { username: string }
}) {
  const url = originalUrl(req)

  return {
    props: {
      lightningAddress: `${username}@${url.hostname}`,
      lnurl: bech32.encode(
        "lnurl",
        bech32.toWords(
          Buffer.from(
            `${url.protocol}//${url.hostname}/.well-known/lnurlp/${username}`,
            "utf8",
          ),
        ),
        1500,
      ),
      webURL: `${url.protocol}//${url.hostname}/${username}`,
    },
  }
}

export default function ({
  lightningAddress,
  lnurl,
  webURL,
}: {
  lightningAddress: string
  lnurl: string
  webURL: string
}) {
  const componentRef = useRef<HTMLDivElement | null>(null)
  const [qrType, setQR] = useState("lnurl")

  return (
    <>
      <div style={{ display: "none" }}>
        <Container fluid ref={componentRef}>
          <br />
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Card className="text-center">
                <Card.Body>
                  <Card.Text>
                    <h1>Pay {lightningAddress}</h1>
                    <QRCode
                      ecLevel="H"
                      value={qrType === "lnurl" ? lnurl : webURL}
                      size={800}
                      logoImage="/BBW-QRLOGO.png"
                      logoWidth={250}
                    />
                  </Card.Text>
                </Card.Body>
                <h2>Powered by Galoy.io</h2>
              </Card>
            </Col>
          </Row>
          <br />
        </Container>
      </div>
      <Container fluid>
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Card className="text-center">
              <Card.Body>
                <Card.Text>
                  <h3>Pay {lightningAddress}</h3>
                  <QRCode
                    ecLevel="H"
                    value={qrType === "lnurl" ? lnurl : webURL}
                    size={300}
                    logoImage="/BBW-QRLOGO.png"
                    logoWidth={100}
                  />
                </Card.Text>
              </Card.Body>
              <h4>
                Powered by <Card.Link href="https://galoy.io">Galoy.io</Card.Link>
              </h4>
            </Card>
          </Col>
        </Row>
        <br />
      </Container>
      <Row className="justify-content-center">
        <Button
          style={{ marginRight: 10 }}
          onClick={() => {
            setQR(qrType === "web" ? "lnurl" : "web")
          }}
        >
          Use {qrType === "web" ? "lnurl" : "web URL"}
        </Button>
        <ReactToPrint
          trigger={() => <Button>Print QR Code</Button>}
          content={() => componentRef.current}
          onBeforeGetContent={() => {
            const qrcodeLogo = document.getElementById("react-qrcode-logo")
            if (qrcodeLogo) {
              qrcodeLogo.style.height = "1000px"
              qrcodeLogo.style.width = "1000px"
            }
          }}
        />
      </Row>
    </>
  )
}
