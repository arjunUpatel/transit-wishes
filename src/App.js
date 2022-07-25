import './App.css';
import { Link, Outlet } from 'react-router-dom';
import React from 'react';

export default function App() {
  return (
    <div className="main">
      <div className="container">
        <img height={300} width={300} src={require('./logo.png')} />
        <h1>Transit</h1>
        <h1 id='wishes'>Wishes</h1>
        <p>Make your transit needs heard</p>
      </div>
      <div className="nav">
        <Link to="/about">About</Link> {" | "}
        <Link to="/the-map">The Map</Link>{" | "}
        <Link to="/make-a-wish">Make a Wish</Link>{" | "}
        <Link to="/voice-your-needs">Voice your Needs</Link>
        <Outlet />
      </div>
    </div>
  );
}