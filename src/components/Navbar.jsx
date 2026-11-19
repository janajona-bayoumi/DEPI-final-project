import { NavLink } from 'react-router-dom'

const links = [
  { to: '/book', label: 'Book' },
  { to: '/queue', label: 'Queue' },
  { to: '/history', label: 'History' },
  { to: '/staff', label: 'Staff' },
]

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-primary px-3">
      <span className="navbar-brand fw-bold">MediQueue</span>
      <div className="navbar-nav ms-auto">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-link${isActive ? ' active fw-bold' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}