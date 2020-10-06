import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

function Header() {
	return (
		<Navbar bg="dark" variant="dark">
		<Container>
			<Navbar.Brand href="https://try.galoy.io">Galoy</Navbar.Brand>
		</Container>
		</Navbar>
	)
}

export default Header