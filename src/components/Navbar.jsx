import { NavLink } from 'react-router-dom'

const links = [
  { to: '/book', label: 'Book' },
  { to: '/queue', label: 'Queue' },
  { to: '/history', label: 'History' },
  { to: '/staff', label: 'Staff' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-logo">MediQueue</span>
      <div className="navbar-links">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}