import { Stack } from 'expo-router'

/**
 * Auth stack without a header. The gate sends signed-out people here.
 */
const AuthLayout = () => <Stack screenOptions={{ headerShown: false }} />

export default AuthLayout
