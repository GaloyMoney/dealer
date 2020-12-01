import React from 'react';
import Header from './header.js'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Jumbotron from 'react-bootstrap/Jumbotron'
import { QRCode } from 'react-qrcode-logo'
import NodeStats from './nodeStats.js'

function Home() {

  return (
    <div>
      <Header />
      <Container>
        <br />
        <Row>
          <Col>
            <h2>Connect to the Bitcoin Beach Lightning Node</h2>
            <br />
            <Jumbotron>
              <Container>
                <Row>
                  <Col>
                    <Card>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <label>Node Public Key: </label> <p style={{ fontSize: 'small', overflowWrap: 'break-word' }}>{window.env.LND_PUB_KEY}</p>
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <label> Node Connection String:</label> <p style={{ fontSize: 'small', overflowWrap: 'break-word' }}>{window.env.LND_PUB_KEY}@{window.env.LND_ADDR}</p>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <NodeStats />
                  </Col>
                </Row>
                <hr />
                <Row className="justify-content-md-center">
                  <Col xs={3}>
                    <QRCode value={`${window.env.LND_PUB_KEY}@${window.env.LND_ADDR}`} size={196} />
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

export default Home