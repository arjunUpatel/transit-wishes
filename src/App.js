import './App.css';
import { Link, Outlet } from 'react-router-dom';
import React from 'react';
import logo from './logo.png';
import Footer from './Footer.js';


export default function App() {
  return (
    <div className='wrapper'>

      <div className="main">
        <div className="container">
          <img height={300} width={300} src={logo} />
          <h1>Transit</h1>
          <h1 id='wishes'>Wishes</h1>
          <p>Make your transit needs heard</p>
        </div>
      </div>

      <div className="home-nav">
        <div className='links'>
          <Link className='home-link' to="/about">About</Link>
          <Link className='home-link' to="/the-map">The Map</Link>
          <Link className='home-link' to="/make-a-wish">Make a Wish</Link>
          <Link className='home-link' to="/voice-your-needs">Voice your Needs</Link>
          <Outlet />
        </div>
      </div>

      <Footer></Footer>

    </div>
  );
}