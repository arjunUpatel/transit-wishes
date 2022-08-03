import React from 'react';
import './Footer.css';
import githubLogo from './images/github-logo.png'
import emailLogo from './images/email-logo.jpg'

export default function Footer() {
  return (
    <footer>
      <div className='footer-top'>
        <div className='footer-stuff'>
          <span>Contribute and help improve this website &ensp;</span>
          <a href='https://github.com/arjunUpatel/transit-wishes' target='_blank'>
            <img height={35} width={35} src={githubLogo} />
          </a>
        </div>
        <div className='footer-stuff'>
          <span>Have success stories or suggestions? Email the developer &ensp;</span>
          <img height={35} width={35} src={emailLogo} />
        </div>
      </div>
      <div className='footer-bottom'>
        <span>© {new Date().getFullYear()} Arjun Patel</span>
      </div>
    </footer>
  )
}
