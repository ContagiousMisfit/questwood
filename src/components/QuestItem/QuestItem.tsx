import type { DragEvent } from 'react'
import type { Quest, QuestPriority } from '../../types/quest'
import PixelIcon from '../ui/PixelIcon/PixelIcon'
import './QuestItem.scss'

type QuestItemProps = {
  quest: Quest
  onToggle: (questId: string) => void
  onDelete: (questId: string) => void
  onClaim: (questId: string) => void
  onMoveToTomorrow: (questId: string) => void
  onMoveToToday: (questId: string) => void
  onDragStart: (questId: string) => void
  onDrop: (questId: string) => void
  isDragging: boolean
  onPriorityChange: (questId: string, priority: QuestPriority) => void
}

function QuestItem({
  quest,
  onToggle,
  onDelete,
  onClaim,
  onMoveToTomorrow,
  onMoveToToday,
  onDragStart,
  onDrop,
  isDragging,
  onPriorityChange,
}: QuestItemProps) {
  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button, input, select')) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', quest.id)
    onDragStart(quest.id)
  }

  return (
    <li
      className={`quest-item priority-${quest.priority ?? 'normal'} ${isDragging ? 'dragging' : ''} ${
        quest.completed ? 'completed' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop(quest.id)
      }}
    >
      <span
        className="quest-drag-handle"
        aria-hidden="true"
        title="Drag to change priority order"
      >
        ⋮⋮
      </span>
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
          <small className={`quest-period quest-period--${quest.period ?? 'daily'}`}>
            {(quest.period ?? 'daily') === 'weekly' ? 'Weekly' : 'Daily'}
          </small>
          <select
            className={`quest-priority-editor priority-${quest.priority ?? 'normal'}`}
            value={quest.priority ?? 'normal'}
            disabled={Boolean(quest.claimedAt)}
            aria-label={`Priority for ${quest.title}`}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              onPriorityChange(quest.id, event.target.value as QuestPriority)
            }
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {quest.scheduledFor ? (
            <small className="quest-priority quest-scheduled">
              Tomorrow
            </small>
          ) : null}
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

      {quest.completed ? (
        <button
          className="quest-action-button claim-button"
          type="button"
          aria-label={`Claim completed quest: ${quest.title}`}
          title="Claim quest rewards"
          onClick={() => onClaim(quest.id)}
        >
          <PixelIcon name="check" />
          <span>Claim</span>
        </button>
      ) : (
        <div className="quest-actions">
        {(quest.period ?? 'daily') === 'daily' ? (
          <button
            className="quest-action-button tomorrow-button"
            type="button"
            aria-label={`Move ${quest.title} to ${quest.scheduledFor ? 'today' : 'tomorrow'}`}
            title={quest.scheduledFor ? 'Move to today' : 'Move to tomorrow'}
            onClick={() => quest.scheduledFor ? onMoveToToday(quest.id) : onMoveToTomorrow(quest.id)}
          >
            <PixelIcon name="today" />
            <span>{quest.scheduledFor ? 'Today' : 'Tomorrow'}</span>
          </button>
        ) : null}
        <button
          className="quest-action-button delete-button"
          type="button"
          aria-label={`Cancel quest: ${quest.title}`}
          title="Cancel quest"
          onClick={() => onDelete(quest.id)}
        >
          <PixelIcon name="close" />
        </button>
        </div>
      )}
    </li>
  )
}

export default QuestItem
