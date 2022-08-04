import Navbar from "./Navbar";
import React from 'react';
import './About.css'
import Footer from "./Footer";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="main">
        <div className='about-container'>
          <h1>About</h1>
          <h2 className="about-subheading">The Motivation</h2>
          <p className="about-para">Public transit in the United States is lackluster. Transit Wishes is a way for people to make their voice heard by mapping places where people wish they had connections through public transit. Data on this website can be helpful as it can influence the decisions of public servants when it comes to planning public transit and provide grassroots movements with elementary data to advocate for future transit projects.</p>
          <h2 className="about-subheading">How to Use the Services on This Website?</h2>
          <p className="about-para">Transit Wishes is a way for people to make their transit needs heard. Contributing to <b>The Map</b> through the <b>Make a Wish</b> page aids in the creation of data which can be used to advocate for transit projects. <b>Voice your Needs</b> page has been created to make it easier for individuals and advocates to obtain the data available on this website and make their needs heard to their elected representatives.</p>
          <h2 className="about-subheading">The Impact</h2>
          <p className="about-para">Have success stories? Use the email at the bottom and share it with the developer to have your story featured here!</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
