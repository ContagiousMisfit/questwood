import type { PlayerStats } from '../../types/quest'
import PixelIcon from '../ui/PixelIcon/PixelIcon'

import './GameHud.scss'

type GameHudProps = {
  stats: PlayerStats
}

function GameHud({ stats }: GameHudProps) {
  const levelProgress = Math.round(
    (stats.currentLevelXp / stats.xpForNextLevel) *
      100,
  )

  return (
    <section
      className="game-hud"
      aria-label="Player progress"
    >
      <div className="game-hud__brand">
        <span className="game-hud__brand-leaf">
          ✦
        </span>

        <div>
          <strong>Questwood</strong>
          <span>Little quests, growing magic</span>
        </div>
      </div>

      <div className="game-hud__level">
        <span className="game-hud__level-badge">
          LV {stats.level}
        </span>

        <div className="game-hud__xp">
          <div className="game-hud__xp-label">
            <span>
              <PixelIcon name="xp" />
              Experience
            </span>

            <strong>
              {stats.currentLevelXp}/
              {stats.xpForNextLevel}
            </strong>
          </div>

          <div
            className="game-hud__xp-track"
            role="progressbar"
            aria-label="Level experience"
            aria-valuemin={0}
            aria-valuemax={stats.xpForNextLevel}
            aria-valuenow={stats.currentLevelXp}
          >
            <span
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="game-hud__resources">
        <div className="game-hud__resource">
          <PixelIcon name="coin" />
          <span>Coins</span>
          <strong>{stats.coins}</strong>
        </div>

        <div className="game-hud__resource">
          <PixelIcon name="streak" />
          <span>Streak</span>
          <strong>{stats.streak}d</strong>
        </div>
      </div>
    </section>
  )
}

export default GameHud
