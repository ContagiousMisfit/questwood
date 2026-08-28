import type { Quest } from '../../types/quest'
import PixelIcon from '../ui/PixelIcon/PixelIcon'
import './QuestItem.scss'

type QuestItemProps = {
  quest: Quest
  onToggle: (questId: string) => void
  onDelete: (questId: string) => void
}

function QuestItem({
  quest,
  onToggle,
  onDelete,
}: QuestItemProps) {
  return (
    <li
      className={`quest-item ${
        quest.completed ? 'completed' : ''
      }`}
    >
      <label className="quest-content">
        <input
          type="checkbox"
          checked={quest.completed}
          onChange={() => onToggle(quest.id)}
        />

        <span className="checkbox" aria-hidden="true">
          {quest.completed ? (
            <PixelIcon name="check" />
          ) : null}
        </span>

        <span className="quest-title">
          {quest.title}
        </span>

        <span className="quest-rewards">
          <span className="quest-reward">
            <PixelIcon name="xp" />
            +{quest.xp}
          </span>

          <span className="quest-reward">
            <PixelIcon name="coin" />
            +{quest.coins ?? 0}
          </span>
        </span>
      </label>

      <button
        className="delete-button"
        type="button"
        aria-label={`Delete quest: ${quest.title}`}
        title="Delete quest"
        onClick={() => onDelete(quest.id)}
      >
        <PixelIcon name="close" />
      </button>
    </li>
  )
}

export default QuestItem
