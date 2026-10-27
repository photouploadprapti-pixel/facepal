import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import type { ReactNode } from 'react'

import { AuthGate } from '@/src/components/auth-gate'
import { AuthProvider } from '@/src/lib/auth'

export { ErrorBoundary } from 'expo-router'

/**
 * Root stack: auth, consent, tabs, and detail screens.
 */
const RootLayout = (): ReactNode => (
  <AuthProvider>
    <AuthGate>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F7F6F4' },
          headerTintColor: '#1A1F24',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F7F6F4' },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="consent" options={{ title: 'Privacy' }} />
        <Stack.Screen name="review" options={{ title: 'Today’s read' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare' }} />
        <Stack.Screen name="yoga/[slug]" options={{ title: 'Face yoga' }} />
      </Stack>
    </AuthGate>
  </AuthProvider>
)

export default RootLayout
