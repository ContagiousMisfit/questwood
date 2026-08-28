import { useState, type FormEvent } from 'react'
import QuestItem from '../QuestItem/QuestItem'
import type { Quest } from '../../types/quest'
import './QuestBoard.scss'
import GamePanel from '../ui/GamePanel/GamePanel'

function QuestBoard() {
    const [quests, setQuests] = useState<Quest[]>([])
    const [newQuestTitle, setNewQuestTitle] = useState('')

    const completedQuests = quests.filter((quest) => quest.completed)
    const completedCount = completedQuests.length

    const earnedXp = completedQuests.reduce(
        (total, quest) => total + quest.xp,
        0,
    )

    const progress =
        quests.length === 0
            ? 0
            : Math.round((completedCount / quests.length) * 100)

    function handleAddQuest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedTitle = newQuestTitle.trim()

        if (!trimmedTitle) {
            return
        }

        const newQuest: Quest = {
            id: crypto.randomUUID(),
            title: trimmedTitle,
            completed: false,
            xp: 20,
        }

        setQuests((currentQuests) => [
            newQuest,
            ...currentQuests,
        ])

        setNewQuestTitle('')
    }

    function handleToggleQuest(questId: string) {
        setQuests((currentQuests) =>
            currentQuests.map((quest) =>
                quest.id === questId
                    ? { ...quest, completed: !quest.completed }
                    : quest,
            ),
        )
    }

    return (
        <GamePanel className="quest-board">
            <header className="board-header">
                <div>
                    <span className="board-eyebrow">Questwood Journal</span>
                    <h1>Today's quests</h1>
                    <p>Small deeds make great adventures.</p>
                </div>

                <div className="xp-display">
                    <span>Earned today</span>
                    <strong>{earnedXp} XP</strong>
                </div>
            </header>

            <div className="progress-section">
                <div className="progress-information">
                    <span>
                        {completedCount} of {quests.length} completed
                    </span>

                    <strong>{progress}%</strong>
                </div>

                <div
                    className="progress-track"
                    role="progressbar"
                    aria-label="Daily quest progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                >
                    <div
                        className="progress-value"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form className="quest-form" onSubmit={handleAddQuest}>
                <label htmlFor="new-quest">
                    Add a new quest
                </label>

                <div className="form-fields">
                    <input
                        id="new-quest"
                        type="text"
                        value={newQuestTitle}
                        onChange={(event) => setNewQuestTitle(event.target.value)}
                        placeholder="What will you accomplish?"
                    />

                    <button type="submit">
                        Add quest
                    </button>
                </div>
            </form>

            {quests.length > 0 ? (
                <ul className="quest-list">
                    {quests.map((quest) => (
                        <QuestItem
                            key={quest.id}
                            quest={quest}
                            onToggle={handleToggleQuest}
                        />
                    ))}
                </ul>
            ) : (
                <div className="empty-state">
                    <span>🌱</span>
                    <p>Your quest journal is empty.</p>
                </div>
            )}
        </GamePanel>
    )
}

export default QuestBoard