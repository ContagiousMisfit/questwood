import { useCallback, useRef } from 'react'

const completionNotes = [
  { frequency: 523.25, delay: 0 },
  { frequency: 659.25, delay: 0.07 },
  { frequency: 783.99, delay: 0.14 },
]

function useQuestSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playCompletionSound = useCallback(() => {
    const audioContext =
      audioContextRef.current ?? new AudioContext()

    audioContextRef.current = audioContext

    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }

    const startTime = audioContext.currentTime

    completionNotes.forEach(({ frequency, delay }) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(
        frequency,
        startTime + delay,
      )

      gain.gain.setValueAtTime(
        0.0001,
        startTime + delay,
      )

      gain.gain.exponentialRampToValueAtTime(
        0.16,
        startTime + delay + 0.015,
      )

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + delay + 0.28,
      )

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.start(startTime + delay)
      oscillator.stop(startTime + delay + 0.3)
    })
  }, [])

  return playCompletionSound
}

export default useQuestSound