import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header.js'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Image from 'react-bootstrap/Image'

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
                    <br/>
                    <label>Node Public Key: </label> <p style={{ fontSize: 'small' }}>{process.env.REACT_APP_PUB_KEY}</p>
                    <label> Node Connection String:</label> <p style={{ fontSize: 'small' }}>{process.env.REACT_APP_PUB_KEY}@{process.env.REACT_APP_ADDR}</p>
                    <hr />
                  </Col>
                  <Col xs={3}>
                    <Image src={"./qrcode.png"} fluid />
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
