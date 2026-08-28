import gardenBackground from '../../assets/backgrounds/questwood-garden.jpg'
import './MagicalBackground.scss'

function MagicalBackground() {
  return (
    <div
      className="magical-background"
      aria-hidden="true"
    >
      <img
        className="garden-background"
        src={gardenBackground}
        alt=""
      />

      <div className="ambient-light" />
      <div className="background-veil" />

      <div className="light-motes">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  )
}

export default MagicalBackground