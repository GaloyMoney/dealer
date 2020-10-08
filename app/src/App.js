import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header.js'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Jumbotron from 'react-bootstrap/Jumbotron'
import QRCode from 'qrcode.react';


function App() {
  return (
    <div>
      <Header />
      <Container>
        <br />
        <Row>
          <Col>
            <Jumbotron>
              <Container>
                <Row>
                  <Col>
                    <h2>Connect to the Bitcoin Beach Lightning Node</h2>
                    <br />
                    <label>Node Public Key: </label> <p style={{ fontSize: 'small', overflowWrap: 'break-word' }}>{window.env.LND_PUB_KEY}</p>
                    <label> Node Connection String:</label> <p style={{ fontSize: 'small', overflowWrap: 'break-word' }}>{window.env.LND_PUB_KEY}@{window.env.LND_ADDR}</p>
                    <hr />
                  </Col>
                  <Col xs={3}>
                    <QRCode value={`${window.env.LND_PUB_KEY}@${window.env.LND_ADDR}`} size={196} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Card>
                      <Card.Body>This is some text within a card body.</Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
