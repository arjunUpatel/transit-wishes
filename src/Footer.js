import React from 'react';
import './Footer.css';
import githubLogo from './images/github-logo.png'
import emailLogo from './images/email-logo.jpg'

export default function Footer() {
  return (
    <footer>
      <div className='footer-top'>
        <a className='footer-img' href='https://github.com/arjunUpatel/transit-wishes' target='_blank' rel="noreferrer">
          <img height={50} width={50} src={githubLogo} alt="Github" />
        </a>
        <a className='footer-img' href='mailto:gib.ansr@gmail.com'>
          <img height={50} width={50} src={emailLogo} alt='Email' />
        </a>
      </div>
      <div className='footer-bottom'>
        © {new Date().getFullYear()} Arjun Patel
      </div>
    </footer>
  )
}
