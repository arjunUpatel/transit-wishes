import './App.css';
import React from 'react';
import logo from './images/logo.png';
import Footer from './Footer.js';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <>
      <Header />
      <div className="home-container">
        <img height={300} width={300} src={logo} alt="Logo" />
        <h1>Transit</h1>
        <h1>Wishes</h1>
        <p className='home-para'>Make your transit needs heard</p>
      </div>
      <Footer />
    </>
  );
}
