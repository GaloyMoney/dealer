import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header.js'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Jumbotron from 'react-bootstrap/Jumbotron'
import QRCode from 'qrcode.react';
import { ApolloClient, InMemoryCache, gql, ApolloProvider, useQuery } from '@apollo/client';
let graphqlUri = window.env.GRAPHQL_URI

const client = new ApolloClient({
  uri: graphqlUri,
  cache: new InMemoryCache()
});

const nodeStatsQuery = () => client.query({
  query: gql`
      query nodeStats {
        nodeStats {
          peersCount,
          channelsCount
        }
      }
    `
})

function App() {

  const [nodeStats, setNodeStats] = useState({
    peersCount: "Loading...",
    channelsCount: "Loading..."
  })

  useEffect(() => {
    async function fetchNodeStats() {
      try {
        let { data: { nodeStats: { channelsCount, peersCount } } } = await nodeStatsQuery()
        setNodeStats({ peersCount, channelsCount })
      } catch (err) {
        console.error("Could not fetch node stats")
      }
    }
    fetchNodeStats()
  }, [])

  return (
    <div>
      <Header />
      <Container>
        <br />
        <Row>
          <Col>
            <h2>Connect to the Bitcoin Beach Lightning Node</h2>
            <br/>
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
                    <Card>
                      <Card.Header>Node Stats</Card.Header>
                      <Card.Body>
                        <ListGroup>
                          <ListGroup.Item variant="success">
                            Peers: {nodeStats.peersCount}
                          </ListGroup.Item>
                          <ListGroup.Item variant="success">
                            Channels: {nodeStats.channelsCount}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <hr />
                <Row>
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

export default App;
