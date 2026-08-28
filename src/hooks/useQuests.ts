import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  PlayerStats,
  Quest,
  QuestPeriod,
} from '../types/quest'

const STORAGE_KEY = 'questwood:quests'
const XP_PER_LEVEL = 100

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

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(quests),
    )
  }, [quests])

  const addQuest = useCallback(
    (
      title: string,
      period: QuestPeriod,
    ) => {
      const trimmedTitle = title.trim()

      if (!trimmedTitle) {
        return null
      }

      const isWeekly = period === 'weekly'

      const newQuest: Quest = {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        period,
        completed: false,
        xp: isWeekly ? 50 : 20,
        coins: isWeekly ? 5 : 2,
        createdAt: new Date().toISOString(),
        completedAt: null,
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
        currentQuests.filter(
          (quest) => quest.id !== questId,
        ),
      )

      return true
    },
    [quests],
  )

  const stats = useMemo<PlayerStats>(() => {
    const completedQuests = quests.filter(
      (quest) => quest.completed,
    )

    const totalXp = completedQuests.reduce(
      (total, quest) => total + quest.xp,
      0,
    )

    const coins = completedQuests.reduce(
      (total, quest) =>
        total + (quest.coins ?? 0),
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
      coins,
      streak: calculateStreak(quests),
    }
  }, [quests])

  return {
    quests,
    stats,
    addQuest,
    toggleQuest,
    deleteQuest,
  }
}

export default useQuests