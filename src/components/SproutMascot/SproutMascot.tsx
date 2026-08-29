import './SproutMascot.scss'
import totoroIdle from '../../assets/generated/totoro-states/state-0.png'
import totoroCreated from '../../assets/generated/totoro-states/state-1.png'
import totoroCompleted from '../../assets/generated/totoro-states/state-2.png'
import totoroRemoved from '../../assets/generated/totoro-states/state-3.png'

export type MascotMood =
  | 'idle'
  | 'created'
  | 'completed'
  | 'removed'

type SproutMascotProps = {
  mood: MascotMood
  animationKey: number
}

const messages: Record<MascotMood, string> = {
  idle: 'Ready for a tiny adventure?',
  created: 'A new quest has sprouted!',
  completed: 'You did it! The garden glows!',
  removed: 'That path can wait for another day.',
}

const sprites: Record<MascotMood, string> = {
  idle: totoroIdle,
  created: totoroCreated,
  completed: totoroCompleted,
  removed: totoroRemoved,
}

function SproutMascot({
  mood,
  animationKey,
}: SproutMascotProps) {
  return (
    <aside
      className={`sprout-mascot sprout-mascot--${mood}`}
      aria-live="polite"
    >
      <div className="sprout-mascot__stage">
        <span
          key={`${mood}-${animationKey}`}
          className={`sprout-mascot__sprite sprout-mascot__sprite--${mood}`}
          style={{ backgroundImage: `url(${sprites[mood]})` }}
          role="img"
          aria-label="Totoro, Questwood's forest guide"
        />
      </div>

      <div className="sprout-mascot__speech">
        {messages[mood]}
      </div>
    </aside>
  )
}

export default SproutMascot
