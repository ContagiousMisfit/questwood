import SproutMascot, {
  type MascotMood,
} from '../SproutMascot/SproutMascot'
import PixelIcon from '../ui/PixelIcon/PixelIcon'

import './MascotGarden.scss'

type MascotGardenProps = {
  mood: MascotMood
  animationKey: number
}

function MascotGarden({
  mood,
  animationKey,
}: MascotGardenProps) {
  return (
    <section
      className="mascot-garden"
      aria-labelledby="mascot-garden-title"
    >
      <header className="mascot-garden__header">
        <PixelIcon name="all" />

        <div>
          <span>Your companion</span>
          <h2 id="mascot-garden-title">Teemo</h2>
        </div>
      </header>

      <SproutMascot
        mood={mood}
        animationKey={animationKey}
      />

      <p className="mascot-garden__hint">
        Complete quests to make Teemo celebrate!
      </p>
    </section>
  )
}

export default MascotGarden
