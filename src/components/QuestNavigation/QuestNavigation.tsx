import type {
  QuestFilter,
} from '../../types/quest'

import './QuestNavigation.scss'

type QuestNavigationProps = {
  activeFilter: QuestFilter

  counts: Record<QuestFilter, number>

  onFilterChange: (
    filter: QuestFilter,
  ) => void
}

const navigationItems: Array<{
  filter: QuestFilter
  label: string
  icon: string
}> = [
  {
    filter: 'daily',
    label: 'Today',
    icon: '☀',
  },
  {
    filter: 'weekly',
    label: 'This Week',
    icon: '❀',
  },
  {
    filter: 'all',
    label: 'All Goals',
    icon: '✦',
  },
]

function QuestNavigation({
  activeFilter,
  counts,
  onFilterChange,
}: QuestNavigationProps) {
  return (
    <nav
      className="quest-navigation"
      aria-label="Quest filters"
    >
      {navigationItems.map(
        ({ filter, label, icon }) => {
          const isActive =
            activeFilter === filter

          return (
            <button
              key={filter}
              className={
                `quest-navigation__item ${
                  isActive ? 'active' : ''
                }`
              }
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                onFilterChange(filter)
              }
            >
              <span
                className="quest-navigation__icon"
                aria-hidden="true"
              >
                {icon}
              </span>

              <span className="quest-navigation__label">
                {label}
              </span>

              <span
                className="quest-navigation__count"
                aria-label={`${counts[filter]} quests`}
              >
                {counts[filter]}
              </span>
            </button>
          )
        },
      )}
    </nav>
  )
}

export default QuestNavigation