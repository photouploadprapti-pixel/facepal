import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text } from 'react-native'

import { CompareSlider } from '@/src/components/compare-slider'
import { Screen } from '@/src/components/screen'
import { fetchCheckins, signedSelfieUrl } from '@/src/lib/data'
import { ui } from '@/src/theme/ui'

/**
 * Slider between the oldest and newest saved selfies.
 */
const CompareScreen = () => {
  const [beforeUri, setBeforeUri] = useState('')
  const [afterUri, setAfterUri] = useState('')
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      const load = async (): Promise<void> => {
        const rows = await fetchCheckins()
        if (rows.length < 2) {
          if (active) setError('Save at least two selfies to compare.')
          return
        }
        const newest = rows[0]
        const oldest = rows[rows.length - 1]
        if (!newest || !oldest) return
        const [olderUrl, newerUrl] = await Promise.all([
          signedSelfieUrl(oldest.storagePath),
          signedSelfieUrl(newest.storagePath),
        ])
        if (!active) return
        setBeforeUri(olderUrl)
        setAfterUri(newerUrl)
        setLabel('Left of the line is the older photo. Drag to reveal the newer one.')
      }
      load().catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load photos')
      })
      return () => {
        active = false
      }
    }, []),
  )

  return (
    <Screen>
      <Text style={ui.muted}>{label}</Text>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {beforeUri && afterUri ? <CompareSlider beforeUri={beforeUri} afterUri={afterUri} /> : null}
      <Text style={ui.muted}>
        Lighting changes the photo more than one week of care.
      </Text>
    </Screen>
  )
}

export default CompareScreen
