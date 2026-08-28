import type {
  HTMLAttributes,
  ReactNode,
} from 'react'

import './GamePanel.scss'

type GamePanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
}

function GamePanel({
  children,
  className = '',
  ...props
}: GamePanelProps) {
  return (
    <section
      className={`game-panel ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default GamePanel