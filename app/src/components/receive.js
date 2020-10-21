import React, { useState, useEffect } from 'react';
import Figure from 'react-bootstrap/Figure'
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

	const updatePendingInvoiceMutation = (hash) => client.mutate({
		mutation: gql`
      mutation publicInvoice {
        publicInvoice(uid: "${uid}") {
          updatePendingInvoice(hash: "${hash}")
        }
      }
    `
	})

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

	const [invoiceStatus, setInvoiceStatus] = useState({
		loading: false,
		invoicePaid: false
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

	const updatePendingInvoice = async (e) => {
		setInvoiceStatus({ loading: true, invoicePaid: false })
		let decoded = window.lightningPayReq.decode(invoice.invoice)
		let [{ data: hash }] = decoded.tags.filter(item => item.tagName === "payment_hash")
		let { data: { publicInvoice: { updatePendingInvoice: invoicePaid } } } = await updatePendingInvoiceMutation(hash)
		setInvoiceStatus({ loading: false, invoicePaid })
		console.log({ invoicePaid })
	}


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
							{invoiceStatus.invoicePaid &&
								<Card.Text>
									<br />
									<Figure>
										<Figure.Image src={process.env.PUBLIC_URL + '/confetti.svg'} width={150} height={150} />
									</Figure>
									<br />
									Payment received!
								</Card.Text>
							}
							{!invoice.loading && !invoiceStatus.invoicePaid && <Card.Body style={{ paddingBottom: '0' }}>
								<Card.Text>
									<QRCode value={`${invoice.invoice}`} size={320} />
									<br />
									<small>Scan using a lightning enabled wallet</small>
								</Card.Text>
								<Button size="sm" disabled={invoiceStatus.loading} onClick={updatePendingInvoice}>{invoiceStatus.loading ? 'Waiting...' : 'Check payment'}</Button>
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