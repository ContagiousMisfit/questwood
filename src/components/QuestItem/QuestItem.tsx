import type { Quest } from '../../types/quest'
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
          {quest.completed ? '✓' : ''}
        </span>

        <span className="quest-title">
          {quest.title}
        </span>

        <span className="quest-reward">
          +{quest.xp} XP
        </span>
      </label>

      <button
        className="delete-button"
        type="button"
        aria-label={`Delete quest: ${quest.title}`}
        title="Delete quest"
        onClick={() => onDelete(quest.id)}
      >
        ×
      </button>
    </li>
  )
}

export default QuestItem