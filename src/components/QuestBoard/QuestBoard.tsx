import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import type {
  QuestFilter,
  QuestPeriod,
} from '../../types/quest'

import useQuestSound from '../../hooks/useQuestSound'
import useQuests from '../../hooks/useQuests'

import QuestItem from '../QuestItem/QuestItem'
import QuestNavigation from '../QuestNavigation/QuestNavigation'
import GamePanel from '../ui/GamePanel/GamePanel'

import './QuestBoard.scss'

const filterContent: Record<
  QuestFilter,
  {
    title: string
    description: string
    emptyMessage: string
  }
> = {
  daily: {
    title: "Today's quests",
    description:
      'Small deeds make great adventures.',
    emptyMessage:
      'Your daily quest journal is empty.',
  },

  weekly: {
    title: "This week's goals",
    description:
      'A little progress each day grows a beautiful week.',
    emptyMessage:
      'No weekly goals have been planted yet.',
  },

  all: {
    title: 'All goals',
    description:
      'Every path through the garden begins with one step.',
    emptyMessage:
      'Your quest garden is waiting for its first seed.',
  },
}

function QuestBoard() {
  const [newQuestTitle, setNewQuestTitle] =
    useState('')

  const [
    newQuestPeriod,
    setNewQuestPeriod,
  ] = useState<QuestPeriod>('daily')

  const [activeFilter, setActiveFilter] =
    useState<QuestFilter>('daily')

  const {
    quests,
    stats,
    addQuest,
    toggleQuest,
    deleteQuest,
  } = useQuests()

  const {
    playCompleteSound,
    playCreateSound,
    playRemoveSound,
  } = useQuestSound()

  const counts = useMemo<
    Record<QuestFilter, number>
  >(() => {
    const daily = quests.filter(
      (quest) =>
        (quest.period ?? 'daily') === 'daily',
    ).length

    const weekly = quests.filter(
      (quest) => quest.period === 'weekly',
    ).length

    return {
      daily,
      weekly,
      all: quests.length,
    }
  }, [quests])

  const visibleQuests = useMemo(() => {
    if (activeFilter === 'all') {
      return quests
    }

    return quests.filter(
      (quest) =>
        (quest.period ?? 'daily') ===
        activeFilter,
    )
  }, [activeFilter, quests])

  const completedCount =
    visibleQuests.filter(
      (quest) => quest.completed,
    ).length

  const progress =
    visibleQuests.length === 0
      ? 0
      : Math.round(
          (completedCount /
            visibleQuests.length) *
            100,
        )

  const currentContent =
    filterContent[activeFilter]

  function handleFilterChange(
    filter: QuestFilter,
  ) {
    setActiveFilter(filter)

    if (filter !== 'all') {
      setNewQuestPeriod(filter)
    }
  }

  function handleAddQuest(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const createdQuest = addQuest(
      newQuestTitle,
      newQuestPeriod,
    )

    if (!createdQuest) {
      return
    }

    setNewQuestTitle('')
    playCreateSound()
  }

  function handleToggleQuest(questId: string) {
    const updatedQuest = toggleQuest(questId)

    if (updatedQuest?.completed) {
      playCompleteSound()
    }
  }

  function handleDeleteQuest(questId: string) {
    const wasDeleted = deleteQuest(questId)

    if (wasDeleted) {
      playRemoveSound()
    }
  }

  return (
    <div className="game-shell">
      <QuestNavigation
        activeFilter={activeFilter}
        counts={counts}
        onFilterChange={handleFilterChange}
      />

      <GamePanel className="quest-board">
        <header className="board-header">
          <div>
            <span className="board-eyebrow">
              Questwood Journal
            </span>

            <h1>{currentContent.title}</h1>

            <p>
              {currentContent.description}
            </p>
          </div>

          <div className="xp-display">
            <span>Total earned</span>

            <strong>
              {stats.totalXp} XP
            </strong>
          </div>
        </header>

        <div className="progress-section">
          <div className="progress-information">
            <span>
              {completedCount} of{' '}
              {visibleQuests.length} completed
            </span>

            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label={`${currentContent.title} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <form
          className="quest-form"
          onSubmit={handleAddQuest}
        >
          <div className="quest-form__heading">
            <label htmlFor="new-quest">
              Add a new quest
            </label>

            <div
              className="period-selector"
              role="group"
              aria-label="Quest period"
            >
              <button
                className={
                  newQuestPeriod === 'daily'
                    ? 'active'
                    : ''
                }
                type="button"
                aria-pressed={
                  newQuestPeriod === 'daily'
                }
                onClick={() =>
                  setNewQuestPeriod('daily')
                }
              >
                Daily
              </button>

              <button
                className={
                  newQuestPeriod === 'weekly'
                    ? 'active'
                    : ''
                }
                type="button"
                aria-pressed={
                  newQuestPeriod === 'weekly'
                }
                onClick={() =>
                  setNewQuestPeriod('weekly')
                }
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="form-fields">
            <input
              id="new-quest"
              type="text"
              value={newQuestTitle}
              onChange={(event) =>
                setNewQuestTitle(
                  event.target.value,
                )
              }
              placeholder="What will you accomplish?"
              maxLength={80}
            />

            <button type="submit">
              Add quest
            </button>
          </div>
        </form>

        {visibleQuests.length > 0 ? (
          <ul className="quest-list">
            {visibleQuests.map((quest) => (
              <QuestItem
                key={quest.id}
                quest={quest}
                onToggle={handleToggleQuest}
                onDelete={handleDeleteQuest}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">
              🌱
            </span>

            <p>
              {currentContent.emptyMessage}
            </p>
          </div>
        )}
      </GamePanel>
    </div>
  )
}

export default QuestBoard