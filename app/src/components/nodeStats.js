import React from 'react';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import { gql, useQuery } from '@apollo/client';

const GET_NODE_STATS = gql`
      query nodeStats {
        nodeStats {
          peersCount,
          channelsCount
        }
      }
    `

function NodeStats() {

  let { loading, error, data } = useQuery(GET_NODE_STATS)

  return (
    <Card>
      <Card.Header>Node Stats</Card.Header>
      <Card.Body>
        <ListGroup>
          <ListGroup.Item variant="success">
            Peers: {error ? "Unavailable" : (loading ? "Loading..." : data.nodeStats.peersCount)}
          </ListGroup.Item>
          <ListGroup.Item variant="success">
            Channels: {error ? "Unavailable" : (loading ? "Loading..." : data.nodeStats.channelsCount)}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

export default NodeStats