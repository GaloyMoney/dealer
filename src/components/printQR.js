import React, { useRef } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import ReactToPrint from "react-to-print";
import { QRCode } from 'react-qrcode-logo'
import Header from './header.js'

const QRContainer = React.forwardRef((props, ref) => {
  return (
    <div style={{ display: "none" }}>
      <Container fluid ref={ref}>
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Card className="text-center">
              <Card.Body>
                <Card.Text>
                  <h1>Pay {props.username}</h1>
                  <QRCode ecLevel="H" value={`https://ln.bitcoinbeach.com/${props.username}`} size={800} logoImage={process.env.PUBLIC_URL + '/BBQRLogo.png'} logoWidth={250} />
                </Card.Text>
              </Card.Body>
              <h2>Powered by Galoy.io</h2>
            </Card>
          </Col>
        </Row>
        <br />
      </Container>
    </div>
  )
})

const PrintQR = ({ username }) => {

  const componentRef = useRef()

  return (
    <div>
      <Header />
      <QRContainer username={username} ref={componentRef} />
      <Container fluid>
        <br />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Card className="text-center">
              <Card.Body>
                <Card.Text>
                  <h3>Pay {username}</h3>
                  <QRCode id="qr" ecLevel="H"  value={`https://ln.bitcoinbeach.com/${username}`} size={300} logoImage={process.env.PUBLIC_URL + '/BBQRLogo.png'} logoWidth={100} />
                </Card.Text>
              </Card.Body>
              <h4>Powered by <Card.Link href="https://galoy.io">Galoy.io</Card.Link></h4>
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
            document.getElementById('react-qrcode-logo').style.height = 1000
            document.getElementById('react-qrcode-logo').style.width = 1000
          }}
        />
      </Row>
    </div>
  )
}

export default PrintQR