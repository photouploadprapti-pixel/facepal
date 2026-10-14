import { Tabs } from 'expo-router'

import { colors } from '@/src/theme/ui'

/**
 * Main tabs after consent: home, scan, yoga, tips, and profile.
 */
const TabLayout = () => (
  <Tabs
    screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.ink,
      tabBarActiveTintColor: colors.plum,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.bg },
      sceneStyle: { backgroundColor: colors.bg },
    }}
  >
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="scan" options={{ title: 'Scan', headerShown: false }} />
    <Tabs.Screen name="yoga" options={{ title: 'Yoga' }} />
    <Tabs.Screen name="tips" options={{ title: 'Tips' }} />
    <Tabs.Screen name="profile" options={{ title: 'You' }} />
  </Tabs>
)

export default TabLayout
