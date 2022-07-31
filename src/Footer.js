import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      {/* <div className='footer-top'>
        <p>Add github image here</p>
        <p>Add linkedin image here</p>
        <p>Add gmail image here (clicking this will copy email to clipboard)</p>
      </div>
       */}
      <div className='footer-bottom'>
        <p>© {new Date().getFullYear()} Arjun Patel</p>
      </div>
    </footer>
  )
}
