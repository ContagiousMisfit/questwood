import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import type {
  QuestFilter,
  QuestPeriod,
  QuestPriority,
} from '../../types/quest'

import useQuestSound from '../../hooks/useQuestSound'
import useQuests from '../../hooks/useQuests'

import QuestItem from '../QuestItem/QuestItem'
import QuestNavigation from '../QuestNavigation/QuestNavigation'
import GameHud from '../GameHud/GameHud'
import MascotGarden from '../MascotGarden/MascotGarden'
import GrowthGarden from '../GrowthGarden/GrowthGarden'
import {
  type MascotMood,
} from '../SproutMascot/SproutMascot'
import PixelIcon from '../ui/PixelIcon/PixelIcon'
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
  archive: {
    title: 'Trash',
    description:
      'Old paths are never truly lost. Restore any goal when you are ready.',
    emptyMessage:
      'Your archive is clear — no forgotten quests here.',
  },
  completed: {
    title: 'Completed quests',
    description: 'A record of every reward you have claimed.',
    emptyMessage: 'Completed adventures will appear here.',
  },
  priority: {
    title: 'Priority quests',
    description:
      'The quests that deserve your attention first — with greater rewards.',
    emptyMessage:
      'No high-priority quests. The path ahead is calm.',
  },
  tomorrow: {
    title: "Tomorrow's quests",
    description:
      'A quiet place for everything you chose to continue tomorrow.',
    emptyMessage:
      'Nothing has been moved to tomorrow.',
  },
}

function QuestBoard() {
  const [newQuestTitle, setNewQuestTitle] =
    useState('')

  const [
    newQuestPeriod,
    setNewQuestPeriod,
  ] = useState<QuestPeriod>('daily')

  const [newQuestPriority, setNewQuestPriority] =
    useState<QuestPriority>('normal')

  const [draggedQuestId, setDraggedQuestId] =
    useState<string | null>(null)

  const [activeFilter, setActiveFilter] =
    useState<QuestFilter>('daily')

  const [mascotMood, setMascotMood] =
    useState<MascotMood>('idle')

  const [mascotAnimationKey, setMascotAnimationKey] =
    useState(0)

  const [growthAnimationKey, setGrowthAnimationKey] =
    useState(0)
  const [gardenCompletionKey, setGardenCompletionKey] =
    useState(0)
  const [groveCelebrationKey, setGroveCelebrationKey] = useState(0)
  const [gardenResetKey, setGardenResetKey] = useState(0)

  const [unlockedPets, setUnlockedPets] = useState(() =>
    Math.max(0, Number(localStorage.getItem('questwood:purchased-companions-v2') ?? 0)),
  )

  const mascotTimerRef = useRef<number | null>(
    null,
  )

  const {
    quests,
    stats,
    addQuest,
    toggleQuest,
    deleteQuest,
    restoreQuest,
    claimQuest,
    claimQuests,
    addCoins,
    spendCoins,
    reorderQuest,
    moveQuestToTomorrow,
    moveQuestToToday,
    permanentlyDeleteQuest,
    clearAllQuests,
    updateQuestPriority,
  } = useQuests()

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const activeQuests = useMemo(
    () => quests.filter((quest) => !quest.claimedAt && !quest.deletedAt),
    [quests],
  )

  const archivedQuests = useMemo(
    () => quests.filter((quest) => quest.deletedAt),
    [quests],
  )
  const completedQuests = useMemo(
    () => quests.filter((quest) => quest.claimedAt && !quest.deletedAt),
    [quests],
  )

  const {
    playCompleteSound,
    playCreateSound,
    playRemoveSound,
  } = useQuestSound()

  const counts = useMemo<
    Record<QuestFilter, number>
  >(() => {
    const daily = activeQuests.filter(
      (quest) =>
        (quest.period ?? 'daily') === 'daily' &&
        (!quest.scheduledFor || quest.scheduledFor <= todayKey),
    ).length

    const weekly = activeQuests.filter(
      (quest) => quest.period === 'weekly',
    ).length

    return {
      daily,
      weekly,
      all: activeQuests.length,
      archive: archivedQuests.length,
      priority: activeQuests.filter(
        (quest) => quest.priority === 'high' || quest.priority === 'urgent',
      ).length,
      tomorrow: activeQuests.filter(
        (quest) => Boolean(quest.scheduledFor && quest.scheduledFor > todayKey),
      ).length,
      completed: completedQuests.length,
    }
  }, [activeQuests, archivedQuests, completedQuests, todayKey])

  const visibleQuests = useMemo(() => {
    if (activeFilter === 'archive') {
      return archivedQuests
    }
    if (activeFilter === 'completed') return completedQuests

    if (activeFilter === 'priority') {
      const weight: Record<QuestPriority, number> = { normal: 0, high: 1, urgent: 2 }
      return activeQuests
        .filter((quest) => (quest.priority ?? 'normal') !== 'normal')
        .sort((a, b) => weight[b.priority ?? 'normal'] - weight[a.priority ?? 'normal'])
    }

    if (activeFilter === 'tomorrow') {
      return activeQuests.filter(
        (quest) => Boolean(quest.scheduledFor && quest.scheduledFor > todayKey),
      )
    }

    if (activeFilter === 'all') {
      return activeQuests
    }

    return activeQuests.filter(
      (quest) =>
        (quest.period ?? 'daily') === activeFilter &&
        (activeFilter !== 'daily' || !quest.scheduledFor || quest.scheduledFor <= todayKey),
    )
  }, [activeFilter, activeQuests, archivedQuests, completedQuests, todayKey])

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

  const allVisibleQuestsCompleted =
    activeFilter !== 'archive' &&
    activeFilter !== 'tomorrow' &&
    activeFilter !== 'completed' &&
    visibleQuests.length > 0 &&
    completedCount === visibleQuests.length

  const todayLabel = new Intl.DateTimeFormat(
    'en',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    },
  ).format(new Date())

  useEffect(() => {
    localStorage.setItem('questwood:purchased-companions-v2', String(unlockedPets))
  }, [unlockedPets])

  useEffect(() => {
    return () => {
      if (mascotTimerRef.current !== null) {
        window.clearTimeout(mascotTimerRef.current)
      }
    }
  }, [])

  function triggerMascot(mood: MascotMood) {
    if (mascotTimerRef.current !== null) {
      window.clearTimeout(mascotTimerRef.current)
    }

    setMascotMood(mood)
    setMascotAnimationKey((currentKey) => currentKey + 1)

    mascotTimerRef.current = window.setTimeout(
      () => setMascotMood('idle'),
      1500,
    )
  }

  function handleFilterChange(
    filter: QuestFilter,
  ) {
    setActiveFilter(filter)

    if (filter !== 'all' && filter !== 'archive' && filter !== 'completed' && filter !== 'priority' && filter !== 'tomorrow') {
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
      newQuestPriority,
    )

    if (!createdQuest) {
      return
    }

    setNewQuestTitle('')
    setGrowthAnimationKey((currentKey) => currentKey + 1)
    playCreateSound()
    triggerMascot('created')
  }

  function handleToggleQuest(questId: string) {
    const updatedQuest = toggleQuest(questId)

    if (updatedQuest?.completed) {
      playCompleteSound()
      triggerMascot('completed')
    }
  }

  function handleDeleteQuest(questId: string) {
    const wasDeleted = deleteQuest(questId)

    if (wasDeleted) {
      playRemoveSound()
      triggerMascot('removed')
    }
  }

  function handleDropQuest(targetId: string) {
    if (draggedQuestId) {
      reorderQuest(draggedQuestId, targetId)
    }
    setDraggedQuestId(null)
  }

  function handleMoveToTomorrow(questId: string) {
    moveQuestToTomorrow(questId)
    playCreateSound()
    triggerMascot('created')
  }

  function handleMoveToToday(questId: string) {
    moveQuestToToday(questId)
    playCreateSound()
    triggerMascot('created')
  }

  function handlePermanentDelete(questId: string, title: string) {
    if (!window.confirm(`Delete “${title}” forever? This cannot be undone.`)) return
    permanentlyDeleteQuest(questId)
    playRemoveSound()
  }

  function handleClaimQuest(questId: string) {
    const wasClaimed = claimQuest(questId)

    if (wasClaimed) {
      setGroveCelebrationKey((key) => key + 1)
      window.dispatchEvent(new CustomEvent('questwood:celebrate'))
      playCompleteSound()
      triggerMascot('completed')
    }
  }

  function handleRestoreQuest(questId: string) {
    const wasRestored = restoreQuest(questId)

    if (wasRestored) {
      setGrowthAnimationKey((currentKey) => currentKey + 1)
      playCreateSound()
      triggerMascot('created')
    }
  }

  function handleCompleteList() {
    const claimedCount = claimQuests(
      visibleQuests.map((quest) => quest.id),
    )

    if (claimedCount > 0) {
      setGardenCompletionKey((currentKey) => currentKey + 1)
      setGroveCelebrationKey((key) => key + 1)
      window.dispatchEvent(new CustomEvent('questwood:celebrate'))
      playCompleteSound()
      triggerMascot('completed')
    }
  }

  function handleHarvest() {
    addCoins(5)
    playCompleteSound()
    triggerMascot('completed')
  }

  function handleUnlockPet() {
    const cost = (unlockedPets + 1) * 10
    if (!spendCoins(cost)) return
    setUnlockedPets((current) => Math.min(4, current + 1))
    playCreateSound()
    triggerMascot('created')
  }

  function handleResetGarden() {
    if (!window.confirm('Restart the Growing Grove? Your quests and coins will stay.')) return
    localStorage.removeItem('questwood:bloomed-plots')
    setGardenResetKey((key) => key + 1)
  }

  function handleClearQuests() {
    if (!window.confirm('Remove every quest from Today, Tomorrow, Completed, and Trash?')) return
    clearAllQuests()
  }

  return (
    <div className="game-shell">
      <GameHud stats={stats} />

      <div className="game-sidebar">
        <QuestNavigation
          activeFilter={activeFilter}
          counts={counts}
          onFilterChange={handleFilterChange}
        />

        <MascotGarden
          mood={mascotMood}
          animationKey={mascotAnimationKey}
        />

        <section className="reset-controls" aria-label="Reset options">
          <button type="button" onClick={handleResetGarden}>Reset garden</button>
          <button type="button" onClick={handleClearQuests}>Clear quests</button>
        </section>
      </div>

      <GamePanel className="quest-board">
        <header className="board-header">
          <div className="board-heading">
            <span className="board-eyebrow">
              Questwood Journal
            </span>

            <div className="board-date">
              <PixelIcon name="today" />
              <span>{todayLabel}</span>
            </div>

            <h1>{currentContent.title}</h1>

            <p>
              {currentContent.description}
            </p>
          </div>

        </header>

        {activeFilter !== 'archive' && activeFilter !== 'completed' ? <div className="progress-section">
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
        </div> : null}

        {activeFilter !== 'archive' && activeFilter !== 'completed' && activeFilter !== 'tomorrow' ? <form
          className="quest-form"
          onSubmit={handleAddQuest}
        >
          <div className="quest-form__heading">
            <label htmlFor="new-quest">
              Add a new quest
            </label>

            <div className="quest-options">
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

            <select
              className={`priority-selector priority-selector--${newQuestPriority}`}
              value={newQuestPriority}
              onChange={(event) =>
                setNewQuestPriority(event.target.value as QuestPriority)
              }
              aria-label="Quest priority"
            >
              <option value="normal">Normal</option>
              <option value="high">High · 1.5× XP</option>
              <option value="urgent">Urgent · 2× XP</option>
            </select>
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
              <PixelIcon name="all" />
              Add quest
            </button>
          </div>
        </form> : null}

        {visibleQuests.length > 0 ? (
          <ul className={`quest-list ${activeFilter === 'archive' ? 'quest-list--archive' : ''}`}>
            {visibleQuests.map((quest) =>
              activeFilter === 'archive' ? (
                <li className="archived-quest" key={quest.id}>
                  <span className="archived-quest__icon">
                    <PixelIcon name="all" />
                  </span>
                  <div>
                    <strong>{quest.title}</strong>
                    <span>
                      {quest.period === 'weekly' ? 'Weekly goal' : 'Daily quest'}
                    </span>
                  </div>
                  <div className="archived-quest__actions">
                    <button type="button" onClick={() => handleRestoreQuest(quest.id)}>
                      <PixelIcon name="check" />
                      Restore
                    </button>
                    <button className="delete-forever" type="button" onClick={() => handlePermanentDelete(quest.id, quest.title)}>
                      <PixelIcon name="close" />
                      Delete
                    </button>
                  </div>
                </li>
              ) : activeFilter === 'completed' ? (
                <li className="completed-quest" key={quest.id}>
                  <PixelIcon name="check" />
                  <div><strong>{quest.title}</strong><span>{quest.period === 'weekly' ? 'Weekly' : 'Daily'} · +{quest.xp} XP · +{quest.coins ?? 0} coins claimed</span></div>
                </li>
              ) : (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  onToggle={handleToggleQuest}
                  onDelete={handleDeleteQuest}
                  onClaim={handleClaimQuest}
                  onDragStart={setDraggedQuestId}
                  onDrop={handleDropQuest}
                  isDragging={draggedQuestId === quest.id}
                  onMoveToTomorrow={handleMoveToTomorrow}
                  onMoveToToday={handleMoveToToday}
                  onPriorityChange={updateQuestPriority}
                />
              ),
            )}
          </ul>
        ) : (
          <div className="empty-state">
            <PixelIcon
              name={
                activeFilter === 'archive'
                  ? 'close'
                  : activeFilter === 'weekly'
                  ? 'weekly'
                  : 'today'
              }
              className="empty-state__icon"
            />

            <p>
              {currentContent.emptyMessage}
            </p>
          </div>
        )}

        {allVisibleQuestsCompleted ? (
          <section className="quest-finale">
            <div className="quest-finale__seal">
              <PixelIcon name="xp" />
            </div>

            <div className="quest-finale__copy">
              <span>Chapter complete</span>
              <strong>
                Every quest has blossomed!
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCompleteList}
            >
              <PixelIcon name="check" />
              {activeFilter === 'daily'
                ? 'Complete day'
                : activeFilter === 'weekly'
                  ? 'Complete week'
                  : 'Complete journal'}
            </button>
          </section>
        ) : null}
      </GamePanel>

      <GrowthGarden
        questCount={quests.filter((quest) => !quest.deletedAt).length}
        animationKey={growthAnimationKey}
        completionKey={gardenCompletionKey}
        celebrationKey={groveCelebrationKey}
        resetKey={gardenResetKey}
        coins={stats.coins}
        unlockedPets={unlockedPets}
        onHarvest={handleHarvest}
        onUnlockPet={handleUnlockPet}
      />
    </div>
  )
}

export default QuestBoard
