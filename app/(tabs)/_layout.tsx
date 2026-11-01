import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { Platform, View } from 'react-native'

import { colors } from '@/src/theme/ui'

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap
  focused: boolean
  color: string
}

/**
 * Renders a bottom-tab icon with a mauve active marker above it.
 * @param name Ionicons glyph.
 * @param focused Whether the tab is selected.
 * @param color Active/inactive tint from the tab bar.
 */
const TabIcon = ({ name, focused, color }: TabIconProps) => (
  <View style={{ alignItems: 'center', gap: 4, minWidth: 28 }}>
    <View
      style={{
        width: 18,
        height: 3,
        borderRadius: 999,
        backgroundColor: focused ? colors.plum : 'transparent',
      }}
    />
    <Ionicons name={name} size={focused ? 23 : 21} color={color} />
  </View>
)

/**
 * Converts the tab tint into a plain string for Ionicons.
 * @param color Tab bar color value.
 */
const tint = (color: string | { toString: () => string }): string =>
  typeof color === 'string' ? color : String(color)

/**
 * Main tabs after consent: home, scan, yoga, tips, and profile.
 */
const TabLayout = () => (
  <Tabs
    screenOptions={{
      headerStyle: { backgroundColor: colors.bgSoft },
      headerTintColor: colors.ink,
      headerShadowVisible: false,
      tabBarActiveTintColor: colors.plum,
      tabBarInactiveTintColor: colors.tabMuted,
      tabBarStyle: {
        backgroundColor: colors.tab,
        borderTopWidth: 0,
        height: Platform.OS === 'web' ? 76 : 68,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'web' ? 12 : 8,
      },
      tabBarItemStyle: { justifyContent: 'center' },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      sceneStyle: { backgroundColor: colors.bgSoft },
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={focused ? 'home' : 'home-outline'}
            focused={focused}
            color={tint(color)}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="scan"
      options={{
        title: 'Scan',
        headerShown: false,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={focused ? 'scan-circle' : 'scan-circle-outline'}
            focused={focused}
            color={tint(color)}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="yoga"
      options={{
        title: 'Yoga',
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={focused ? 'body' : 'body-outline'}
            focused={focused}
            color={tint(color)}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="tips"
      options={{
        title: 'Tips',
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={focused ? 'bulb' : 'bulb-outline'}
            focused={focused}
            color={tint(color)}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'You',
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            name={focused ? 'person-circle' : 'person-circle-outline'}
            focused={focused}
            color={tint(color)}
          />
        ),
      }}
    />
  </Tabs>
)

export default TabLayout
