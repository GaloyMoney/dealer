import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import QRCode from 'qrcode.react';
import Header from './header.js'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

function Receive({ uid }) {

	let graphqlUri = window.env.GRAPHQL_URI

	const client = new ApolloClient({
		uri: graphqlUri,
		cache: new InMemoryCache()
	});

	const addPublicInvoiceMutation = () => client.mutate({
		mutation: gql`
      mutation publicInvoice {
        publicInvoice(uid: "${uid}") {
          addInvoice
        }
      }
    `
	})

	const [invoice, setInvoice] = useState({
		invoice: null,
		loading: true
	})

	useEffect(() => {
		async function fetchPublicInvoice() {
			try {
				let { data: { publicInvoice: { addInvoice: publicInvoice } } } = await addPublicInvoiceMutation()
				setInvoice({ invoice: publicInvoice, loading: false })
			} catch (err) {
				console.error(err)
			}
		}
		fetchPublicInvoice()
	}, [])


	return (
		<div>
			<Header />
			<Container fluid >
				<br />
				<Row className="justify-content-md-center">
					<Col md="auto">
						<Card className="text-center">
							<Card.Header>
								Pay {uid}
							</Card.Header>
							{invoice.loading && <div> <br />Loading...</div>}
							{!invoice.loading && <Card.Body style={{paddingBottom:'0'}}>
								<Card.Text>
									<QRCode includeMargin="true" value={`${invoice.invoice}`} size={320} />
									<br />
									<small>Scan using a lightning enabled wallet</small>
								</Card.Text>
								<Button size="sm">Check payment</Button>
							</Card.Body>}
							<Card.Body>
								<Card.Link href={window.location.origin}>Open a channel with us</Card.Link>
							</Card.Body>
							<Card.Footer className="text-muted">
								Powered by <Card.Link href="https://try.galoy.io">Galoy</Card.Link>
							</Card.Footer>
						</Card>
					</Col>
				</Row>
				<br />
			</Container>

		</div>
	)
}

export default Receive