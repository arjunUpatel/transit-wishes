import React from 'react';
import './Footer.css';
import githubLogo from './images/github-logo.png'
import emailLogo from './images/email-logo.jpg'

export default function Footer() {
  return (
    <footer>
      <div className='footer-top'>
        <div className='footer-stuff'>
          <b>Contribute and help improve this website: &ensp;</b>
          <a href='https://github.com/arjunUpatel/transit-wishes' target='_blank'>
            <img height={25} width={25} src={githubLogo} />
          </a>
        </div>
        <div className='footer-stuff'>
          <b>Have success stories or suggestions? Email the developer: &ensp;</b>
          <a href=' mailto:gib.ansr@gmail.com '>
            <img height={25} width={25} src={emailLogo} />
          </a>
        </div>
      </div>
      <div className='footer-bottom'>
        <b>© {new Date().getFullYear()} Arjun Patel</b>
      </div>
    </footer>
  )
}
