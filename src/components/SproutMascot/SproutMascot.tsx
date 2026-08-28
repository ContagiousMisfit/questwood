import './SproutMascot.scss'

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
          role="img"
          aria-label="Questwood's cheerful guide"
        />
      </div>

      <div className="sprout-mascot__speech">
        {messages[mood]}
      </div>
    </aside>
  )
}

export default SproutMascot
