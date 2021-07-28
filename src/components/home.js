import React from "react"
import Header from "./header.js"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Card from "react-bootstrap/Card"
import ListGroup from "react-bootstrap/ListGroup"
import Jumbotron from "react-bootstrap/Jumbotron"
import { gql, useQuery } from "@apollo/client"

const GET_NODE_STATS = gql`
  query nodeStats {
    nodeStats {
      peersCount
      channelsCount
      id
    }
  }
`

function Home() {
  let nodeUrl =
    window.env.GRAPHQL_URI.indexOf("testnet") === -1
      ? `https://1ml.com/node/`
      : `https://1ml.com/testnet/node/`

  let { loading, error, data } = useQuery(GET_NODE_STATS)

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
                            <label>Node Public Key: </label>{" "}
                            <p style={{ fontSize: "small", overflowWrap: "break-word" }}>
                              {error
                                ? "Unavailable"
                                : loading
                                ? "Loading..."
                                : data.nodeStats.id}
                            </p>
                          </ListGroup.Item>
                          <ListGroup.Item>
                            {error ? (
                              "Unavailable"
                            ) : loading ? (
                              "Loading..."
                            ) : (
                              <a href={nodeUrl + `${data.nodeStats.id}`}>
                                Connect the Bitcoin Beach Lightning node
                              </a>
                            )}
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
                            Peers:{" "}
                            {error
                              ? "Unavailable"
                              : loading
                              ? "Loading..."
                              : data.nodeStats.peersCount}
                          </ListGroup.Item>
                          <ListGroup.Item variant="success">
                            Channels:{" "}
                            {error
                              ? "Unavailable"
                              : loading
                              ? "Loading..."
                              : data.nodeStats.channelsCount}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <hr />
              </Container>
            </Jumbotron>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home
