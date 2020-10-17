import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container'
import QRCode from 'qrcode.react';
import Header from './header.js'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

function Receive({uid}, {graphqlUri}) {

	// let graphqlUri = window.env.GRAPHQL_URI
	// console.log({graphqlUri})

	const client = new ApolloClient({
		uri: graphqlUri,
		cache: new InMemoryCache()
	});

	const addPublicInvoiceQuery = () => client.query({
		query: gql`
      mutation publicInvoice {
        publicInvoice(uid: "${uid}") {
          addInvoice
        }
      }
    `
	})

	const [invoice, setInvoice] = useState(0)

	useEffect(() => {
		async function fetchPublicInvoice() {
			try {
				let invoice = await addPublicInvoiceQuery()
				console.log({invoice})
				// setNodeStats()
			} catch (err) {
				// setNodeStats({ nodeStatsAvailable: false })
				console.error(err)
			}
		}
		fetchPublicInvoice()
	}, [])


	return (
		<div>
			<Header />
			<Container>
				{uid}
			</Container>
		</div>
	)
}
// <QRCode value={props.uid} size={196} />
export default Receive