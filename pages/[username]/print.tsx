import { useRouter } from "next/router"
import { useRef } from "react"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"
import Button from "react-bootstrap/Button"
import ReactToPrint from "react-to-print"
import { QRCode } from "react-qrcode-logo"

const PrintQR = () => {
  const router = useRouter()
  const { username } = router.query
  const componentRef = useRef()

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
                    <h1>Pay {username}</h1>
                    <QRCode
                      ecLevel="H"
                      value={`https://ln.bitcoinbeach.com/${username}`}
                      size={800}
                      logoImage="/BBQRLogo.png"
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
                  <h3>Pay {username}</h3>
                  <QRCode
                    ecLevel="H"
                    value={`https://ln.bitcoinbeach.com/${username}`}
                    size={300}
                    logoImage="/BBQRLogo.png"
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
      <Row className="justify-content-md-center">
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

export default PrintQR
