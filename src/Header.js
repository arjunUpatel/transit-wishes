import { Outlet, Link } from 'react-router-dom'
import './Header.css'
import React from 'react'
import logo from './images/logo.png'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'

export default function Header() {
  return (
    <>
      <Navbar id='nav-main'>
        <Container>
          <Navbar.Brand id='nav-link' as={Link} to='/'>
            <img height={45} width={45} src={logo} alt="Logo" />
            <span id='nav-brand-text'>Transit Wishes</span>
          </Navbar.Brand>
          <Nav>
            <Nav.Link id='nav-link' as={Link} to='/about'>About</Nav.Link>
            <Nav.Link id='nav-link' as={Link} to='/the-map'>The Map</Nav.Link>
            <Nav.Link id='nav-link' as={Link} to='/contribute'>Contribute</Nav.Link>
            {/* <Nav.Link as={Link} to='voice-your-needs'>Voice your Needs</Nav.Link> */}
            <Outlet />
          </Nav>
        </Container>
      </Navbar>
    </>
  )
}
