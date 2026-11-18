import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Book from './pages/Book'
import Queue from './pages/Queue'
import History from './pages/History'
import Staff from './pages/Staff'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<Book />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/history" element={<History />} />
        <Route path="/staff" element={<Staff />} />
      </Route>
    </Routes>
  )
}