const variants = {
  primary: 'btn-primary',
  secondary: 'btn-outline-primary',
  danger: 'btn-danger',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`btn ${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}