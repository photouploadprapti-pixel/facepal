import type { Checkin, FindingCode, HabitDay } from '@/src/types/models'

/**
 * Local calendar day as YYYY-MM-DD.
 * @param date Date to format. Defaults to now.
 */
export const localDayKey = (date = new Date()): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Empty habit row for today before the user logs anything.
 * @param userId Signed-in user id.
 * @param day Calendar day key.
 */
export const emptyHabitDay = (userId: string, day = localDayKey()): HabitDay => ({
  id: '',
  userId,
  day,
  sleepHours: null,
  waterGlasses: 0,
  spfWorn: false,
  stressLevel: null,
  cleansedAm: false,
  moisturized: false,
  cleansedPm: false,
  note: '',
})

/**
 * Counts how many AM/PM care steps are checked.
 * @param habit Day log.
 */
export const routineDoneCount = (habit: HabitDay): number =>
  [habit.cleansedAm, habit.moisturized, habit.cleansedPm, habit.spfWorn].filter(Boolean).length

/**
 * Suggests a calm next step from the latest selfie findings.
 * @param findings Codes from the newest check-in.
 */
export const tonightFocus = (
  findings: FindingCode[],
): { title: string; body: string; yogaSlug?: string } => {
  if (findings.includes('under_eye')) {
    return {
      title: 'Tonight: rest the under-eyes',
      body: 'Dim screens an hour early, sip water, and try Eye decompression before bed.',
      yogaSlug: 'eye-decompression',
    }
  }
  if (findings.includes('redness') || findings.includes('blemish')) {
    return {
      title: 'Tonight: keep cheeks calm',
      body: 'Skip harsh scrubbing. Cool rinse, light moisturizer, then Cheek lift if flush feels high.',
      yogaSlug: 'cheek-lift',
    }
  }
  if (findings.includes('texture') || findings.includes('uneven_tone')) {
    return {
      title: 'Tonight: gentle texture care',
      body: 'Cleanse softly, moisturize, plan SPF for morning, and run Forehead smooth or Full glow flow.',
      yogaSlug: 'glow-flow',
    }
  }
  return {
    title: 'Tonight: keep the streak',
    body: 'Skin looks steady. Log water and sleep, then a short Jawline release keeps the ritual going.',
    yogaSlug: 'jawline-release',
  }
}

/**
 * Builds short wellness associations from habits + selfie quality.
 * Observations only — not medical cause claims.
 * @param habits Newest-first habit days.
 * @param checkins Newest-first check-ins.
 */
export const weeklyHabitInsights = (habits: HabitDay[], checkins: Checkin[]): string[] => {
  const lines: string[] = []
  if (habits.length < 3 || checkins.length < 2) {
    return [
      'Log sleep, water, SPF, and your AM/PM steps for a few days to unlock personal habit notes.',
    ]
  }

  const byDay = new Map(habits.map((row) => [row.day, row]))
  const paired: { quality: number; sleep: number | null; water: number; spf: boolean }[] = []
  for (const checkin of checkins.slice(0, 14)) {
    const day = localDayKey(new Date(checkin.capturedAt))
    const habit = byDay.get(day)
    if (!habit) continue
    paired.push({
      quality: checkin.quality,
      sleep: habit.sleepHours,
      water: habit.waterGlasses,
      spf: habit.spfWorn,
    })
  }

  if (paired.length >= 3) {
    const withSleep = paired.filter((row) => row.sleep !== null) as {
      quality: number
      sleep: number
      water: number
      spf: boolean
    }[]
    if (withSleep.length >= 3) {
      const rested = withSleep.filter((row) => row.sleep >= 7)
      const short = withSleep.filter((row) => row.sleep < 6.5)
      if (rested.length >= 2 && short.length >= 1) {
        const restedAvg =
          rested.reduce((sum, row) => sum + row.quality, 0) / rested.length
        const shortAvg = short.reduce((sum, row) => sum + row.quality, 0) / short.length
        if (restedAvg - shortAvg >= 5) {
          lines.push(
            `On days you logged 7+ hours of sleep, face quality averaged ${Math.round(restedAvg)} vs ${Math.round(shortAvg)} on shorter nights.`,
          )
        }
      }
    }

    const hydrated = paired.filter((row) => row.water >= 6)
    const dry = paired.filter((row) => row.water <= 3)
    if (hydrated.length >= 2 && dry.length >= 1) {
      const hi = hydrated.reduce((sum, row) => sum + row.quality, 0) / hydrated.length
      const lo = dry.reduce((sum, row) => sum + row.quality, 0) / dry.length
      if (hi - lo >= 4) {
        lines.push(
          `Higher water days (6+ glasses) lined up with a face quality average of ${Math.round(hi)}.`,
        )
      }
    }

    const spfDays = paired.filter((row) => row.spf)
    const noSpf = paired.filter((row) => !row.spf)
    if (spfDays.length >= 2 && noSpf.length >= 1) {
      const withSpf = spfDays.reduce((sum, row) => sum + row.quality, 0) / spfDays.length
      const without = noSpf.reduce((sum, row) => sum + row.quality, 0) / noSpf.length
      if (withSpf - without >= 3) {
        lines.push(
          `SPF-marked days averaged ${Math.round(withSpf)} face quality vs ${Math.round(without)} without SPF logged.`,
        )
      }
    }
  }

  const spfStreak = habits.filter((row) => row.spfWorn).length
  if (spfStreak >= 3) {
    lines.push(`You marked SPF on ${spfStreak} of your recent habit days — strong UV habit.`)
  }

  const routineDays = habits.filter((row) => routineDoneCount(row) >= 3).length
  if (routineDays >= 3) {
    lines.push(`Care checklist hit 3+ steps on ${routineDays} recent days.`)
  }

  if (lines.length === 0) {
    lines.push(
      'Keep logging habits next to selfies. FacePal only reports patterns from your own days.',
    )
  }
  return lines.slice(0, 3)
}
