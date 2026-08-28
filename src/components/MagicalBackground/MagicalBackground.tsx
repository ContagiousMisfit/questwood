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

      <div className="background-shade" />

      <div className="cloud-glow">
        <span />
        <span />
      </div>

      <div className="sun-rays" />

      <div className="light-motes">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={`mote-${index}`} />
        ))}
      </div>

      <div className="floating-leaves">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={`leaf-${index}`} />
        ))}
      </div>

      <div className="floating-petals">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={`petal-${index}`} />
        ))}
      </div>
    </div>
  )
}

export default MagicalBackground