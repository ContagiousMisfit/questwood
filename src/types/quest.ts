export type QuestPeriod =
  | 'daily'
  | 'weekly'

export type QuestFilter =
  | QuestPeriod
  | 'all'
  | 'archive'
  | 'priority'
  | 'tomorrow'
  | 'completed'

export type QuestPriority = 'normal' | 'high' | 'urgent'

export type Quest = {
  id: string
  title: string
  completed: boolean
  xp: number
  period?: QuestPeriod
  coins?: number
  createdAt?: string
  completedAt?: string | null
  claimedAt?: string | null
  deletedAt?: string | null
  priority?: QuestPriority
  scheduledFor?: string | null
}

export type PlayerStats = {
  totalXp: number
  currentLevelXp: number
  xpForNextLevel: number
  level: number
  coins: number
  streak: number
}
