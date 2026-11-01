import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { AppIcon } from '@/src/components/app-icon'
import { setPendingScan } from '@/src/lib/pending-scan'
import { colors, ui } from '@/src/theme/ui'

/**
 * Front camera with an oval so each daily selfie lines up the same way.
 */
const ScanScreen = () => {
  const cameraRef = useRef<CameraView>(null)
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const capture = async (): Promise<void> => {
    const camera = cameraRef.current
    if (!camera) return
    setBusy(true)
    setError('')
    try {
      const photo = await camera.takePictureAsync({ quality: 0.7 })
      if (!photo?.uri) throw new Error('Camera did not return a photo')
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 480 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      )
      if (!resized.base64) throw new Error('Could not read the photo')
      setPendingScan(resized.base64)
      router.push('/review')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Capture failed')
    } finally {
      setBusy(false)
    }
  }

  if (!permission) return <View style={styles.fill} />
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <AppIcon name="camera" size={36} color={colors.ink} />
        <Text style={ui.body}>FacePal needs the camera for your daily selfie.</Text>
        <Pressable style={ui.button} onPress={() => void requestPermission()}>
          <AppIcon name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={ui.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={styles.fill} facing="front" mirror />
      <View style={styles.topChip}>
        <View style={styles.chip}>
          <View style={styles.dot} />
          <Text style={styles.chipText}>AI Face Lens</Text>
        </View>
      </View>
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.oval}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <Text style={styles.hint}>
          Center your face in the oval. Use soft, even light — FacePal checks photo quality before
          scoring.
        </Text>
      </View>
      <View style={styles.bar}>
        {error ? <Text style={[ui.error, { color: '#FCA5A5' }]}>{error}</Text> : null}
        <Pressable style={styles.capture} disabled={busy} onPress={() => void capture()}>
          <View style={styles.captureInner}>
            <AppIcon name="camera" size={28} color={colors.ink} />
          </View>
        </Pressable>
        <Text style={styles.captureLabel}>{busy ? 'Working…' : 'Capture selfie'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0E1F2F' },
  center: {
    flex: 1,
    backgroundColor: colors.bgSoft,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  topChip: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.plum,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: colors.plum,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.plum,
  },
  tl: { top: 10, left: 18, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 10, right: 18, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 10, left: 18, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 10, right: 18, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: {
    marginTop: 16,
    color: colors.plumSoft,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 28,
  },
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 42,
    alignItems: 'center',
    gap: 10,
  },
  capture: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 4,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.plumSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  captureLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
})

export default ScanScreen
