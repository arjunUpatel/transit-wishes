import { Outlet, Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className='navWords'>
      <Link id='name' className='navWords' to="/">
        <img>
        </img>
        Transit Wishes
      </Link>
      <Link id='about' className='navWords' to="/about">About</Link>
      <Link id='map' className='navWords' to="/the-map">The Map</Link>
      <Link id='submit' className='navWords' to="/make-a-wish">Make a Wish</Link>
      <Outlet />
    </nav>
  )
}