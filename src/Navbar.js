import { Outlet, Link } from 'react-router-dom'
import './Navbar.css'
import React from 'react';
import logo from './images/logo.png'


export default function Navbar() {
  return (
    <div className='nav-main'>
      <nav className='nav-container'>
        <Link id='nav-home' className='nav-link' to="/">
          <img height={45} width={45} src={logo} />
          <a id='nav-home-words'> Transit Wishes</a>
        </Link>
        <div className='nav-words'>
          <Link id='nav-about' className='nav-link' to="/about">About</Link>
          <Link id='nav-map' className='nav-link' to="/the-map">The Map</Link>
          <Link id='nav-submit' className='nav-link' to="/make-a-wish">Make a Wish</Link>
          <Link id='nav-spam' className='nav-link' to="/voice-your-needs">Voice your Needs</Link>
          <Outlet />
        </div>
      </nav>
    </div>
  )
}
