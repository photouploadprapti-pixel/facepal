import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

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
        <Text style={ui.body}>FacePal needs the camera for your daily selfie.</Text>
        <Pressable style={ui.button} onPress={() => void requestPermission()}>
          <Text style={ui.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={styles.fill} facing="front" mirror />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.oval} />
        <Text style={styles.hint}>Center your face in the oval, in even light.</Text>
      </View>
      <View style={styles.bar}>
        {error ? <Text style={ui.error}>{error}</Text> : null}
        <Pressable style={ui.button} disabled={busy} onPress={() => void capture()}>
          <Text style={ui.buttonText}>{busy ? 'Working…' : 'Capture'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
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
    borderWidth: 3,
    borderColor: '#FFF8F3',
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 16,
    color: '#FFF8F3',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    gap: 8,
  },
})

export default ScanScreen
