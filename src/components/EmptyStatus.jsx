export default function EmptyState({ message = 'Nothing to show yet.' }) {
  return <div className="text-center text-muted py-5">{message}</div>
}