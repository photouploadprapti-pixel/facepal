import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { FaceGuide } from '@/src/components/face-guide'
import { ui, colors } from '@/src/theme/ui'
import type { YogaStep } from '@/src/types/models'

type YogaSessionProps = {
  steps: YogaStep[]
  onComplete: () => void
}

/**
 * Plays routine steps with a pose animation and a countdown.
 * @param steps Ordered moves for the routine.
 * @param onComplete Called once when the last step finishes.
 */
export const YogaSession = ({ steps, onComplete }: YogaSessionProps) => {
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(steps[0]?.seconds ?? 0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const finished = useRef(false)
  const step = steps[index]

  useEffect(() => {
    if (!playing || done) return
    const timer = setInterval(() => {
      setLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [playing, done])

  useEffect(() => {
    if (done || !playing || left > 0) return
    if (index >= steps.length - 1) {
      if (finished.current) return
      finished.current = true
      setPlaying(false)
      setDone(true)
      onComplete()
      return
    }
    const next = steps[index + 1]
    setIndex((current) => current + 1)
    setLeft(next?.seconds ?? 0)
  }, [done, playing, left, index, steps, onComplete])

  if (!step) return <Text style={ui.muted}>This routine has no steps yet.</Text>

  return (
    <View style={ui.card}>
      <FaceGuide animationKey={step.animationKey} playing={playing} />
      <Text style={ui.muted}>
        Step {index + 1} of {steps.length}
      </Text>
      <Text style={[ui.body, { fontWeight: '700' }]}>{step.title}</Text>
      <Text style={ui.body}>{step.instruction}</Text>
      <Text style={{ color: colors.plum, fontSize: 28, fontWeight: '700' }}>{left}s</Text>
      {done ? (
        <Text style={ui.body}>Session complete. Come back tomorrow.</Text>
      ) : (
        <Pressable style={ui.button} onPress={() => setPlaying((value) => !value)}>
          <Text style={ui.buttonText}>{playing ? 'Pause' : 'Start'}</Text>
        </Pressable>
      )}
    </View>
  )
}
