import { useEffect, useState, type PointerEvent } from 'react'
import plantSprites from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Objects/Basic Plants.png'
import finalPlantSprites from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Objects/Basic_Grass_Biom_things.png'
import chickenSprites from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Characters/Free Chicken Sprites.png'
import cowSprites from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Characters/Free Cow Sprites.png'
import rabbitSprites from '../../assets/generated/rabbit-companion.png'
import catSprites from '../../assets/generated/cat-companion.png'
import chickenHouse from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Objects/Free_Chicken_House.png'
import chest from '../../assets/Sprout Lands - Sprites - Basic pack/Sprout Lands - Sprites - Basic pack/Objects/Chest.png'
import PixelIcon from '../ui/PixelIcon/PixelIcon'
import './GrowthGarden.scss'

type GrowthGardenProps = {
  questCount: number
  animationKey: number
  completionKey: number
  celebrationKey: number
  resetKey: number
  coins: number
  unlockedPets: number
  onHarvest: () => void
  onUnlockPet: () => void
}

const plots = ['Rosebud', 'Moonleaf', 'Starroot', 'Honeyfern']
const companions = [
  { kind: 'chicken', sprite: chickenSprites, name: 'Chicken' },
  { kind: 'cow', sprite: cowSprites, name: 'Cow' },
  { kind: 'rabbit', sprite: rabbitSprites, name: 'Woodland rabbit' },
  { kind: 'cat', sprite: catSprites, name: 'Garden cat' },
]

function GrowthGarden({
  questCount,
  animationKey,
  completionKey,
  celebrationKey,
  resetKey,
  coins,
  unlockedPets,
  onHarvest,
  onUnlockPet,
}: GrowthGardenProps) {
  const [bloomedPlots, setBloomedPlots] = useState<boolean[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('questwood:bloomed-plots') ?? '[false,false,false,false]')
    } catch {
      return [false, false, false, false]
    }
  })
  const [harvesting, setHarvesting] = useState<number | null>(null)
  const [petPositions, setPetPositions] = useState<Array<{ x: number; y: number }>>(() => {
    try { return JSON.parse(localStorage.getItem('questwood:pet-positions') ?? '[]') } catch { return [] }
  })
  const [draggingPet, setDraggingPet] = useState<{ index: number; dx: number; dy: number } | null>(null)
  const petCost = (unlockedPets + 1) * 10

  useEffect(() => {
    localStorage.setItem('questwood:bloomed-plots', JSON.stringify(bloomedPlots))
  }, [bloomedPlots])

  useEffect(() => {
    localStorage.setItem('questwood:pet-positions', JSON.stringify(petPositions))
  }, [petPositions])

  useEffect(() => {
    if (resetKey === 0) return
    const timer = window.setTimeout(() => setBloomedPlots([false, false, false, false]), 0)
    return () => window.clearTimeout(timer)
  }, [resetKey])

  useEffect(() => {
    if (completionKey === 0) return
    const completionTimer = window.setTimeout(
      () => setBloomedPlots([true, true, true, true]),
      0,
    )
    return () => window.clearTimeout(completionTimer)
  }, [completionKey])

  function harvest(index: number) {
    if (harvesting !== null) return
    setHarvesting(index)
    window.setTimeout(() => {
      setBloomedPlots((current) =>
        current.map((value, plotIndex) => plotIndex === index ? true : value),
      )
      setHarvesting(null)
      onHarvest()
    }, 850)
  }

  function startPetDrag(event: PointerEvent<HTMLButtonElement>, index: number) {
    const position = petPositions[index] ?? { x: 24 + index * 64, y: 120 + index * 56 }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingPet({ index, dx: event.clientX - position.x, dy: event.clientY - position.y })
  }

  function movePet(event: PointerEvent<HTMLButtonElement>) {
    if (!draggingPet) return
    const nextPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 58, event.clientX - draggingPet.dx)),
      y: Math.max(0, Math.min(window.innerHeight - 58, event.clientY - draggingPet.dy)),
    }
    setPetPositions((current) => {
      const next = [...current]
      next[draggingPet.index] = nextPosition
      return next
    })
  }

  return (
    <section className={`growth-garden ${celebrationKey > 0 ? 'grove-celebrating' : ''}`} aria-labelledby="growth-garden-title">
      {companions.slice(0, unlockedPets).map((pet, index) => {
        const position = petPositions[index] ?? { x: 24 + index * 64, y: 120 + index * 56 }
        return (
          <button className="floating-companion" style={{ left: position.x, top: position.y }} type="button"
            aria-label={`Drag ${pet.name}`} key={`floating-${index}`}
            onPointerDown={(event) => startPetDrag(event, index)} onPointerMove={movePet}
            onPointerUp={() => setDraggingPet(null)}>
            <span className={`garden-pet ${pet.kind}`} style={{ backgroundImage: `url(${pet.sprite})` }} />
          </button>
        )
      })}
      <header className="growth-garden__header">
        <div>
          <span className="growth-garden__eyebrow">Garden</span>
          <h2 id="growth-garden-title">The Growing Grove</h2>
          <p>New quests grow plants. Mature plants can be harvested.</p>
        </div>
        <div className="growth-garden__scenery" aria-hidden="true">
          <img src={chest} alt="" />
          <img src={chickenHouse} alt="" />
        </div>
      </header>

      <div className={`growth-garden__plots ${completionKey > 0 ? 'garden-complete' : ''}`} key={`garden-${animationKey}-${completionKey}`}>
        {plots.map((name, index) => {
          const stage = bloomedPlots[index]
            ? 5
            : Math.max(0, Math.min(4, questCount - index))
          const isReady = stage === 4
          return (
            <div className={`garden-plot ${harvesting === index ? 'harvesting' : ''}`} key={name}>
              <button
                className={`garden-plant-button ${isReady ? 'ready' : ''}`}
                type="button"
                disabled={!isReady || harvesting !== null}
                onClick={() => harvest(index)}
                aria-label={isReady ? `Harvest ${name}` : `${name}, growth stage ${stage} of 5`}
              >
                <span
                  className={`garden-plant garden-plant--${stage} ${stage === 5 ? `final-plant final-plant--${index}` : ''}`}
                  style={{ backgroundImage: `url(${stage === 5 ? finalPlantSprites : plantSprites})` }}
                  aria-hidden="true"
                />
                {isReady ? <span className="garden-plant__ready">Harvest</span> : null}
              </button>
              <strong>{name}</strong>
              <span className="garden-plot__stage">{stage === 5 ? 'Complete' : `${stage}/5`}</span>
            </div>
          )
        })}
      </div>

      <div className="garden-pets" aria-label="Garden companions">
        <div className="garden-pets__copy">
          <span>Companions</span>
          <strong>{unlockedPets}/{companions.length} purchased</strong>
        </div>
        {unlockedPets < 4 ? (
          <button
            className="garden-pets__invite"
            type="button"
            disabled={coins < petCost}
            onClick={onUnlockPet}
            title={coins < petCost ? `You need ${petCost} coins` : 'Invite a new garden companion'}
          >
            <span
              className={`garden-pet ${companions[unlockedPets].kind}`}
              style={{ backgroundImage: `url(${companions[unlockedPets].sprite})` }}
              aria-hidden="true"
            />
            <span className="garden-pets__cost">
              {petCost}<PixelIcon name="coin" />
            </span>
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default GrowthGarden
