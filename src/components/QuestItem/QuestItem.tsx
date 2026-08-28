import type { Quest } from '../../types/quest'
import './QuestItem.scss'

type QuestItemProps = {
    quest: Quest
    onToggle: (questId: string) => void
}

function QuestItem({ quest, onToggle }: QuestItemProps) {
    return (
        <li className={`quest-item ${quest.completed ? 'completed' : ''}`}>
            <label>
                <input
                    type="checkbox"
                    checked={quest.completed}
                    onChange={() => onToggle(quest.id)}
                />

                <span className="checkbox" aria-hidden="true">
                    {quest.completed ? '✓' : ''}
                </span>

                <span className="quest-title">{quest.title}</span>

                <span className="quest-reward">
                    +{quest.xp} XP
                </span>
            </label>
        </li>
    )
}

export default QuestItem