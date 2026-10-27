import { Tabs } from 'expo-router'
import { Platform, View } from 'react-native'

import { colors } from '@/src/theme/ui'

type TabDotProps = {
  focused: boolean
}

/**
 * Small pill that marks the active tab without a missing icon font.
 * @param focused Whether this tab is selected.
 */
const TabDot = ({ focused }: TabDotProps) => (
  <View
    style={{
      width: focused ? 18 : 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: focused ? '#5EEAD4' : colors.tabMuted,
      marginBottom: 4,
    }}
  />
)

/**
 * Main tabs after consent: home, scan, yoga, tips, and profile.
 */
const TabLayout = () => (
  <Tabs
    screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.ink,
      headerShadowVisible: false,
      tabBarActiveTintColor: '#FFFFFF',
      tabBarInactiveTintColor: colors.tabMuted,
      tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
      tabBarStyle: {
        backgroundColor: colors.tab,
        borderTopWidth: 0,
        height: Platform.OS === 'web' ? 72 : 64,
        paddingTop: 8,
      },
      tabBarItemStyle: { justifyContent: 'center' },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
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
