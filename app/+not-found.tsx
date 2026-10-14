import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

import { colors, ui } from '@/src/theme/ui'

/**
 * Fallback when a route does not exist.
 */
const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Not found' }} />
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, gap: 12 }}>
      <Text style={ui.title}>This screen is missing</Text>
      <Link href="/" style={ui.body}>
        Go home
      </Link>
    </View>
  </>
)

export default NotFoundScreen
