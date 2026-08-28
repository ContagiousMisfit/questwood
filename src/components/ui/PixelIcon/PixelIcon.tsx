import allIcon from '../../../assets/sprout/icons/all.png'
import checkIcon from '../../../assets/sprout/icons/check.png'
import closeIcon from '../../../assets/sprout/icons/close.png'
import coinIcon from '../../../assets/sprout/icons/coin.png'
import streakIcon from '../../../assets/sprout/icons/streak.png'
import todayIcon from '../../../assets/sprout/icons/today.png'
import weeklyIcon from '../../../assets/sprout/icons/weekly.png'
import xpIcon from '../../../assets/sprout/icons/xp.png'

import './PixelIcon.scss'

const icons = {
  all: allIcon,
  check: checkIcon,
  close: closeIcon,
  coin: coinIcon,
  streak: streakIcon,
  today: todayIcon,
  weekly: weeklyIcon,
  xp: xpIcon,
} as const

export type PixelIconName = keyof typeof icons

type PixelIconProps = {
  name: PixelIconName
  label?: string
  className?: string
}

function PixelIcon({
  name,
  label,
  className = '',
}: PixelIconProps) {
  return (
    <img
      className={`pixel-icon ${className}`}
      src={icons[name]}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
    />
  )
}

export default PixelIcon
