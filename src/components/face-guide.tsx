import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'

import type { AnimationKey } from '@/src/types/models'
import { colors } from '@/src/theme/ui'

type FaceGuideProps = {
  animationKey: AnimationKey
  playing: boolean
}

/**
 * Draws a simple face and loops the pose for the current yoga step.
 * @param animationKey Which pose to emphasize.
 * @param playing Whether the step timer is running.
 */
export const FaceGuide = ({ animationKey, playing }: FaceGuideProps) => {
  const phase = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!playing) {
      phase.stopAnimation()
      phase.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(phase, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [phase, playing])

  const eyeScale = phase.interpolate({
    inputRange: [0, 1],
    outputRange: animationKey === 'blink' ? [1, 0.2] : [1, 1],
  })
  const mouthScale = phase.interpolate({
    inputRange: [0, 1],
    outputRange:
      animationKey === 'smile' || animationKey === 'kiss'
        ? [1, 1.35]
        : animationKey === 'puff'
          ? [1, 1.5]
          : [1, 1],
  })
  const browLift = phase.interpolate({
    inputRange: [0, 1],
    outputRange: animationKey === 'brow' ? [0, -10] : [0, 0],
  })
  const jawShift = phase.interpolate({
    inputRange: [0, 1],
    outputRange: animationKey === 'jaw' ? [-8, 8] : [0, 0],
  })
  const neckShift = phase.interpolate({
    inputRange: [0, 1],
    outputRange: animationKey === 'neck' ? [-12, 12] : [0, 0],
  })

  return (
    <View style={styles.frame}>
      <Animated.View style={[styles.neck, { transform: [{ translateX: neckShift }] }]} />
      <Animated.View style={[styles.face, { transform: [{ translateX: jawShift }] }]}>
        <Animated.View style={[styles.brow, styles.browLeft, { transform: [{ translateY: browLift }] }]} />
        <Animated.View style={[styles.brow, styles.browRight, { transform: [{ translateY: browLift }] }]} />
        <Animated.View style={[styles.eye, styles.eyeLeft, { transform: [{ scaleY: eyeScale }] }]} />
        <Animated.View style={[styles.eye, styles.eyeRight, { transform: [{ scaleY: eyeScale }] }]} />
        <Animated.View style={[styles.mouth, { transform: [{ scaleX: mouthScale }] }]} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neck: {
    position: 'absolute',
    bottom: 18,
    width: 46,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.blush,
  },
  face: {
    width: 140,
    height: 170,
    borderRadius: 70,
    backgroundColor: '#F6D7CB',
    borderWidth: 2,
    borderColor: colors.plum,
  },
  eye: {
    position: 'absolute',
    top: 62,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
  },
  eyeLeft: { left: 36 },
  eyeRight: { right: 36 },
  brow: {
    position: 'absolute',
    top: 46,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.plum,
  },
  browLeft: { left: 30 },
  browRight: { right: 30 },
  mouth: {
    position: 'absolute',
    bottom: 42,
    alignSelf: 'center',
    left: 48,
    width: 40,
    height: 14,
    borderRadius: 10,
    backgroundColor: '#C47B84',
  },
})
