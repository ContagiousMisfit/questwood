import { useEffect } from 'react'

let audioContext: AudioContext | null = null

function playClick(kind: 'tap' | 'drop') {
  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()

  const start = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(kind === 'drop' ? 245 : 420, start)
  oscillator.frequency.exponentialRampToValueAtTime(kind === 'drop' ? 185 : 520, start + .055)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(kind === 'drop' ? .055 : .035, start + .008)
  gain.gain.exponentialRampToValueAtTime(.0001, start + .075)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(start)
  oscillator.stop(start + .08)
}

export default function useInterfaceSounds() {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      const interactive = target.closest('button, select, input, [role="button"]')
      if (interactive && !(interactive as HTMLButtonElement).disabled) playClick('tap')
    }
    const onPointerUp = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.floating-companion, [draggable="true"]')) playClick('drop')
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointerup', onPointerUp)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }, [])
}
