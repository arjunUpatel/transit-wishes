import Navbar from "./Navbar";
import React from 'react';
import './About.css'
import Footer from "./Footer";

export default function About() {
  return (
    <>
    <Navbar></Navbar>
      <div className='about-container'>
        <h1>About</h1>
      </div>
      <Footer></Footer>
    </>
  )
}
