import { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Slider from '@react-native-community/slider'

import { colors } from '@/src/theme/ui'

type CompareSliderProps = {
  beforeUri: string
  afterUri: string
}

/**
 * Overlays two selfies and reveals the later photo with a slider.
 * @param beforeUri Signed URL for the older photo.
 * @param afterUri Signed URL for the newer photo.
 */
export const CompareSlider = ({ beforeUri, afterUri }: CompareSliderProps) => {
  const [split, setSplit] = useState(0.5)
  const [width, setWidth] = useState(0)

  return (
    <View
      style={styles.frame}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Image source={{ uri: afterUri }} style={styles.photo} />
      <View style={[styles.clip, { width: width * split }]}>
        <Image source={{ uri: beforeUri }} style={[styles.photo, { width }]} />
      </View>
      <View style={[styles.handle, { left: Math.max(width * split - 1, 0) }]} />
      <Slider
        style={styles.slider}
        minimumValue={0.05}
        maximumValue={0.95}
        value={split}
        onValueChange={setSplit}
        minimumTrackTintColor={colors.plum}
        maximumTrackTintColor={colors.blush}
        thumbTintColor={colors.plum}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    height: 420,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 360,
  },
  clip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 360,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 360,
    backgroundColor: colors.plum,
  },
  slider: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
  },
})
