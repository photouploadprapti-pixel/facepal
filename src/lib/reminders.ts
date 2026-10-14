import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

/**
 * Schedules a once-a-day local reminder. Web skips this.
 * @param hour Hour in local time, 0–23.
 */
export const scheduleDailyReminder = async (hour: number): Promise<void> => {
  if (Platform.OS === 'web') return
  const settings = await Notifications.getPermissionsAsync()
  let granted = settings.granted
  if (!granted) {
    const asked = await Notifications.requestPermissionsAsync()
    granted = asked.granted
  }
  if (!granted) return
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FacePal check-in',
      body: 'Take today’s selfie in the same light and keep your streak.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  })
}
