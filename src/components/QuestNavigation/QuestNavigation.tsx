import type {
  QuestFilter,
} from '../../types/quest'
import PixelIcon, {
  type PixelIconName,
} from '../ui/PixelIcon/PixelIcon'

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
  icon: PixelIconName
}> = [
  {
    filter: 'daily',
    label: 'Today',
    icon: 'today',
  },
  {
    filter: 'weekly',
    label: 'This Week',
    icon: 'weekly',
  },
  {
    filter: 'all',
    label: 'All Goals',
    icon: 'all',
  },
  {
    filter: 'tomorrow',
    label: 'Tomorrow',
    icon: 'today',
  },
  {
    filter: 'priority',
    label: 'Priorities',
    icon: 'xp',
  },
  {
    filter: 'archive',
    label: 'Trash',
    icon: 'close',
  },
  {
    filter: 'completed',
    label: 'Completed',
    icon: 'check',
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
                <PixelIcon name={icon} />
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
