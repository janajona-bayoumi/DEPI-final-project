const colors = {
  booked: 'text-bg-primary',
  'in-progress': 'text-bg-warning',
  done: 'text-bg-success',
  cancelled: 'text-bg-secondary',
}

export default function StatusBadge({ status }) {
  return <span className={`badge ${colors[status] ?? 'text-bg-light'}`}>{status}</span>
}