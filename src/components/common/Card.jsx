import './Card.css'

const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`card ${padding ? 'card-padding' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default Card