import { useCallback, useRef } from 'react'

type SoundNote = {
  frequency: number
  delay: number
  duration: number
}

type OscillatorSound = {
  notes: SoundNote[]
  type: OscillatorType
  volume: number
}

function useQuestSound() {
  const audioContextRef = useRef<AudioContext | null>(
    null,
  )

  const playSound = useCallback(
    ({
      notes,
      type,
      volume,
    }: OscillatorSound) => {
      const audioContext =
        audioContextRef.current ??
        new AudioContext()

      audioContextRef.current = audioContext

      if (audioContext.state === 'suspended') {
        void audioContext.resume()
      }

      const startTime = audioContext.currentTime

      notes.forEach(
        ({ frequency, delay, duration }) => {
          const oscillator =
            audioContext.createOscillator()

          const gain = audioContext.createGain()

          const noteStart = startTime + delay
          const noteEnd = noteStart + duration

          oscillator.type = type

          oscillator.frequency.setValueAtTime(
            frequency,
            noteStart,
          )

          gain.gain.setValueAtTime(
            0.0001,
            noteStart,
          )

          gain.gain.exponentialRampToValueAtTime(
            volume,
            noteStart + 0.015,
          )

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            noteEnd,
          )

          oscillator.connect(gain)
          gain.connect(audioContext.destination)

          oscillator.start(noteStart)
          oscillator.stop(noteEnd)
        },
      )
    },
    [],
  )

  const playCompleteSound = useCallback(() => {
    playSound({
      type: 'triangle',
      volume: 0.15,
      notes: [
        {
          frequency: 523.25,
          delay: 0,
          duration: 0.25,
        },
        {
          frequency: 659.25,
          delay: 0.08,
          duration: 0.27,
        },
        {
          frequency: 783.99,
          delay: 0.16,
          duration: 0.34,
        },
      ],
    })
  }, [playSound])

  const playCreateSound = useCallback(() => {
    playSound({
      type: 'triangle',
      volume: 0.12,
      notes: [
        {
          frequency: 392,
          delay: 0,
          duration: 0.16,
        },
        {
          frequency: 523.25,
          delay: 0.06,
          duration: 0.22,
        },
      ],
    })
  }, [playSound])

  const playRemoveSound = useCallback(() => {
    playSound({
      type: 'sine',
      volume: 0.11,
      notes: [
        {
          frequency: 392,
          delay: 0,
          duration: 0.2,
        },
        {
          frequency: 329.63,
          delay: 0.07,
          duration: 0.23,
        },
        {
          frequency: 261.63,
          delay: 0.14,
          duration: 0.28,
        },
      ],
    })
  }, [playSound])

  return {
    playCompleteSound,
    playCreateSound,
    playRemoveSound,
  }
}

export default useQuestSound