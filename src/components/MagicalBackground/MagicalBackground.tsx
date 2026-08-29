import gardenBackground from '../../assets/backgrounds/cute-background2.jpg'
import { useEffect, useState } from 'react'

import './MagicalBackground.scss'

function MagicalBackground() {
  const [celebrationKey, setCelebrationKey] = useState(0)

  useEffect(() => {
    const celebrate = () => setCelebrationKey((key) => key + 1)
    window.addEventListener('questwood:celebrate', celebrate)
    return () => window.removeEventListener('questwood:celebrate', celebrate)
  }, [])

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

      {celebrationKey > 0 ? (
        <div className="completion-burst" key={celebrationKey}>
          {Array.from({ length: 22 }, (_, index) => <span key={index} />)}
        </div>
      ) : null}
    </div>
  )
}

export default MagicalBackground
