import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  PlayerStats,
  Quest,
  QuestPeriod,
  QuestPriority,
} from '../types/quest'

const STORAGE_KEY = 'questwood:quests'
const BONUS_COINS_KEY = 'questwood:bonus-coins'
const SPENT_COINS_KEY = 'questwood:spent-coins'
const COIN_BALANCE_KEY = 'questwood:coin-balance-v2'
const XP_PER_LEVEL = 100

function getRewards(period: QuestPeriod, priority: QuestPriority) {
  const multiplier = priority === 'urgent' ? 2 : priority === 'high' ? 1.5 : 1
  return {
    xp: Math.round((period === 'weekly' ? 50 : 20) * multiplier),
    coins: Math.round((period === 'weekly' ? 5 : 2) * multiplier),
  }
}

function normalizeQuest(quest: Quest): Quest {
  const now = new Date().toISOString()

  return {
    ...quest,
    period: quest.period ?? 'daily',
    coins:
      quest.coins ??
      Math.max(1, Math.round(quest.xp / 10)),
    createdAt: quest.createdAt ?? now,
    completedAt: quest.completed
      ? (quest.completedAt ?? now)
      : null,
    claimedAt: quest.claimedAt ?? null,
    deletedAt: quest.deletedAt ?? null,
    priority: quest.priority ?? 'normal',
    scheduledFor: quest.scheduledFor ?? null,
  }
}

function loadQuests(): Quest[] {
  try {
    const storedValue =
      localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .filter((quest): quest is Quest => {
        if (
          typeof quest !== 'object' ||
          quest === null
        ) {
          return false
        }

        const candidate =
          quest as Partial<Quest>

        return (
          typeof candidate.id === 'string' &&
          typeof candidate.title === 'string' &&
          typeof candidate.completed ===
            'boolean' &&
          typeof candidate.xp === 'number'
        )
      })
      .map(normalizeQuest)
  } catch {
    return []
  }
}

function loadCoinBalance() {
  const savedValue = localStorage.getItem(COIN_BALANCE_KEY)
  const savedBalance = savedValue === null ? Number.NaN : Number(savedValue)

  if (Number.isFinite(savedBalance) && savedBalance >= 0) return savedBalance

  const legacyEarned = loadQuests()
    .filter((quest) => quest.completed && quest.claimedAt && !quest.deletedAt)
    .reduce((total, quest) => total + (quest.coins ?? 0), 0)
  const legacyBonus = Number(localStorage.getItem(BONUS_COINS_KEY) ?? 0)
  const legacySpent = Number(localStorage.getItem(SPENT_COINS_KEY) ?? 0)

  return Math.max(
    0,
    legacyEarned +
      (Number.isFinite(legacyBonus) ? legacyBonus : 0) -
      (Number.isFinite(legacySpent) ? legacySpent : 0),
  )
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(date.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function calculateStreak(quests: Quest[]) {
  const completedDays = new Set(
    quests
      .filter(
        (quest) =>
          quest.completed &&
          quest.completedAt,
      )
      .map((quest) =>
        getLocalDateKey(
          new Date(quest.completedAt as string),
        ),
      ),
  )

  if (completedDays.size === 0) {
    return 0
  }

  const cursor = new Date()
  const todayKey = getLocalDateKey(cursor)

  // A streak from yesterday remains visible until
  // the current day ends.
  if (!completedDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0

  while (
    completedDays.has(getLocalDateKey(cursor))
  ) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function useQuests() {
  const [quests, setQuests] =
    useState<Quest[]>(loadQuests)
  const [coinBalance, setCoinBalance] = useState(loadCoinBalance)
  const claimedQuestIdsRef = useRef(
    new Set(quests.filter((quest) => quest.claimedAt).map((quest) => quest.id)),
  )

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(quests),
    )
  }, [quests])

  useEffect(() => {
    localStorage.setItem(COIN_BALANCE_KEY, String(coinBalance))
  }, [coinBalance])

  const addQuest = useCallback(
    (
      title: string,
      period: QuestPeriod,
      priority: QuestPriority,
    ) => {
      const trimmedTitle = title.trim()

      if (!trimmedTitle) {
        return null
      }

      const rewards = getRewards(period, priority)

      const newQuest: Quest = {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        period,
        completed: false,
        xp: rewards.xp,
        coins: rewards.coins,
        priority,
        scheduledFor: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        claimedAt: null,
        deletedAt: null,
      }

      setQuests((currentQuests) => [
        newQuest,
        ...currentQuests,
      ])

      return newQuest
    },
    [],
  )

  const toggleQuest = useCallback(
    (questId: string) => {
      const selectedQuest = quests.find(
        (quest) => quest.id === questId,
      )

      if (!selectedQuest) {
        return null
      }

      const willBeCompleted =
        !selectedQuest.completed

      const updatedQuest: Quest = {
        ...selectedQuest,
        completed: willBeCompleted,
        completedAt: willBeCompleted
          ? new Date().toISOString()
          : null,
      }

      setQuests((currentQuests) =>
        currentQuests.map((quest) =>
          quest.id === questId
            ? updatedQuest
            : quest,
        ),
      )

      return updatedQuest
    },
    [quests],
  )

  const deleteQuest = useCallback(
    (questId: string) => {
      const questExists = quests.some(
        (quest) => quest.id === questId,
      )

      if (!questExists) {
        return false
      }

      setQuests((currentQuests) =>
        currentQuests.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                deletedAt: new Date().toISOString(),
              }
            : quest,
        ),
      )

      return true
    },
    [quests],
  )

  const reorderQuest = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return
      setQuests((currentQuests) => {
        const fromIndex = currentQuests.findIndex((quest) => quest.id === draggedId)
        const toIndex = currentQuests.findIndex((quest) => quest.id === targetId)
        if (fromIndex < 0 || toIndex < 0) return currentQuests
        const reordered = [...currentQuests]
        const [draggedQuest] = reordered.splice(fromIndex, 1)
        reordered.splice(toIndex, 0, draggedQuest)
        return reordered
      })
    },
    [],
  )

  const moveQuestToTomorrow = useCallback((questId: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const scheduledFor = getLocalDateKey(tomorrow)

    setQuests((currentQuests) =>
      currentQuests.map((quest) =>
        quest.id === questId
          ? { ...quest, completed: false, completedAt: null, scheduledFor }
          : quest,
      ),
    )
  }, [])

  const moveQuestToToday = useCallback((questId: string) => {
    setQuests((currentQuests) =>
      currentQuests.map((quest) =>
        quest.id === questId ? { ...quest, scheduledFor: null } : quest,
      ),
    )
  }, [])

  const permanentlyDeleteQuest = useCallback((questId: string) => {
    setQuests((currentQuests) =>
      currentQuests.filter((quest) => quest.id !== questId),
    )
  }, [])

  const clearAllQuests = useCallback(() => setQuests([]), [])

  const updateQuestPriority = useCallback(
    (questId: string, priority: QuestPriority) => {
      setQuests((currentQuests) =>
        currentQuests.map((quest) => {
          if (quest.id !== questId || quest.claimedAt) return quest
          const rewards = getRewards(quest.period ?? 'daily', priority)
          return { ...quest, priority, ...rewards }
        }),
      )
    },
    [],
  )

  const restoreQuest = useCallback(
    (questId: string) => {
      const questExists = quests.some(
        (quest) => quest.id === questId && quest.deletedAt,
      )

      if (!questExists) return false

      setQuests((currentQuests) =>
        currentQuests.map((quest) =>
          quest.id === questId
            ? { ...quest, deletedAt: null }
            : quest,
        ),
      )

      return true
    },
    [quests],
  )

  const claimQuest = useCallback(
    (questId: string) => {
      const selectedQuest = quests.find(
        (quest) => quest.id === questId,
      )

      if (
        !selectedQuest?.completed ||
        selectedQuest.claimedAt ||
        claimedQuestIdsRef.current.has(questId)
      ) {
        return false
      }

      claimedQuestIdsRef.current.add(questId)
      setCoinBalance((current) => current + (selectedQuest.coins ?? 0))

      setQuests((currentQuests) =>
        currentQuests.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                claimedAt:
                  new Date().toISOString(),
              }
            : quest,
        ),
      )

      return true
    },
    [quests],
  )

  const claimQuests = useCallback(
    (questIds: string[]) => {
      const idsToClaim = new Set(questIds)

      const claimableQuests = quests.filter(
        (quest) =>
          idsToClaim.has(quest.id) &&
          quest.completed &&
          !quest.claimedAt &&
          !claimedQuestIdsRef.current.has(quest.id),
      )

      const claimableCount = claimableQuests.length

      if (claimableCount === 0) {
        return 0
      }

      const claimedAt = new Date().toISOString()
      claimableQuests.forEach((quest) => claimedQuestIdsRef.current.add(quest.id))
      setCoinBalance((current) =>
        current + claimableQuests.reduce((total, quest) => total + (quest.coins ?? 0), 0),
      )

      setQuests((currentQuests) =>
        currentQuests.map((quest) =>
          idsToClaim.has(quest.id) &&
          quest.completed &&
          !quest.claimedAt
            ? { ...quest, claimedAt }
            : quest,
        ),
      )

      return claimableCount
    },
    [quests],
  )

  const stats = useMemo<PlayerStats>(() => {
    const completedQuests = quests.filter(
      (quest) => quest.completed && quest.claimedAt && !quest.deletedAt,
    )

    const totalXp = completedQuests.reduce(
      (total, quest) => total + quest.xp,
      0,
    )

    const level =
      Math.floor(totalXp / XP_PER_LEVEL) + 1

    const currentLevelXp =
      totalXp % XP_PER_LEVEL

    return {
      totalXp,
      currentLevelXp,
      xpForNextLevel: XP_PER_LEVEL,
      level,
      coins: coinBalance,
      streak: calculateStreak(
        quests.filter((quest) => !quest.deletedAt),
      ),
    }
  }, [quests, coinBalance])

  const addCoins = useCallback((amount: number) => {
    setCoinBalance((current) => current + Math.max(0, amount))
  }, [])

  const spendCoins = useCallback(
    (amount: number) => {
      if (amount <= 0 || stats.coins < amount) return false
      setCoinBalance((current) => current - amount)
      return true
    },
    [stats.coins],
  )

  return {
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
  }
}

export default useQuests
