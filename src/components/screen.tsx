import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ui } from '@/src/theme/ui'

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
}

/**
 * Cream page shell with safe area padding.
 * @param children Screen content.
 * @param scroll When true, content scrolls. Defaults to true.
 */
export const Screen = ({ children, scroll = true }: ScreenProps) => {
  if (!scroll) {
    return <SafeAreaView style={ui.screen}>{children}</SafeAreaView>
  }
  return (
    <SafeAreaView style={ui.screen}>
      <ScrollView contentContainerStyle={ui.content}>{children}</ScrollView>
    </SafeAreaView>
  )
}

type FieldProps = {
  label: string
  children: ReactNode
}

/**
 * Label stacked above a form control.
 * @param label Visible label.
 * @param children Input element.
 */
export const Field = ({ label, children }: FieldProps) => (
  <View style={{ gap: 6 }}>
    <Text style={ui.muted}>{label}</Text>
    {children}
  </View>
)
