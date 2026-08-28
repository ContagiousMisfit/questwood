export type QuestPeriod = 'daily' | 'weekly'

export type QuestFilter =
  | QuestPeriod
  | 'all'

export type Quest = {
  id: string
  title: string
  period: QuestPeriod
  completed: boolean
  xp: number
  coins: number
  createdAt: string
  completedAt: string | null
}