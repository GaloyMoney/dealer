import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
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
          <Col >
            <h2>Connect to the Bitcoin Beach <br /> Lightning Node</h2>
          </Col>
          <Col xs={9}>
            <Jumbotron>
              <Container>
                <Row>
                  <Col>
                    <label>Node Public Key: </label> <p style={{fontSize: 'small'}}>0325bb9bda523a85dc834b190289b7e25e8d92615ab2f2abffbe97983f0bb12ffb</p>
                    <label> Node Connection String:</label> <p style={{fontSize: 'small'}}>0325bb9bda523a85dc834b190289b7e25e8d92615ab2f2abffbe97983f0bb12ffb<br/>@35.188.203.196:9735</p>
                    <hr/>
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
