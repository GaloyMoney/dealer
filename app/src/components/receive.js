import React, { useEffect, useState } from 'react';
import Figure from 'react-bootstrap/Figure'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import QRCode from 'qrcode.react';
import Header from './header.js'
import { gql, useMutation } from '@apollo/client';

function Receive({ uid }) {


	const UPDATE_PENDING_INVOICE = gql`
      mutation PublicInvoice($hash: String!, $uid: String!) {
        publicInvoice(uid: $uid) {
          updatePendingInvoice(hash: $hash)
        }
      }
    `

	const GENERATE_PUBLIC_INVOICE = gql`
      mutation publicInvoice($uid: String!) {
        publicInvoice(uid: $uid) {
          addInvoice
        }
      }
    `

	const [updatePendingInvoice, { loading: invoiceUpdating }] = useMutation(UPDATE_PENDING_INVOICE, {
		onCompleted({ publicInvoice: { updatePendingInvoice: invoicePaid } }) {
			setInvoicePaid(invoicePaid)
		}
	})


	const [generatePublicInvoice, { loading: invoiceLoading }] = useMutation(GENERATE_PUBLIC_INVOICE, {
		onCompleted({ publicInvoice: { addInvoice } }) {
			setInvoice(addInvoice)
		}
	})


	const [invoice, setInvoice] = useState(0)

	const [invoicePaid, setInvoicePaid] = useState(false)

	useEffect(() => {
		generatePublicInvoice({ variables: { uid } })
	}, [])

	const checkPayment = async () => {
		let decoded = window.lightningPayReq.decode(invoice)
		let [{ data: hash }] = decoded.tags.filter(item => item.tagName === "payment_hash")
		updatePendingInvoice({ variables: { uid, hash } })
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
							{(invoiceLoading || !invoice) && <div> <br />Loading...</div>}
							{invoicePaid &&
									<div>
									<br />
									<Figure>
										<Figure.Image src={process.env.PUBLIC_URL + '/confetti.svg'} width={150} height={150} />
									</Figure>
									<br />
									Payment received!
									</div>
							}
							{!invoiceLoading && !invoicePaid && <Card.Body style={{ paddingBottom: '0' }}>
								<Card.Text>
									<QRCode value={`${invoice}`} size={320} />
									<br />
									<small>Scan using a lightning enabled wallet</small>
								</Card.Text>
								<Button size="sm" disabled={invoiceUpdating} onClick={checkPayment}>{invoiceUpdating ? 'Waiting...' : 'Check payment'}</Button>
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