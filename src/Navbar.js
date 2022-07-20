import { Outlet, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className='nav'>
      <Link to="/">Transit Wishes</Link> |{" "}
      <Link to="/about">About</Link> |{" "}
      <Link to="/the-map">The Map</Link> |{" "}
      <Link to="/make-a-wish">Make a Wish</Link>
      <Outlet />
    </nav>
  )
}