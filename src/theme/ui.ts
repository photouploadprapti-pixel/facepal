import { Platform, StyleSheet } from 'react-native'

/**
 * Calm clinical-wellness palette: soft neutrals, one teal accent, no candy pink.
 */
export const colors = {
  bg: '#F7F6F4',
  ink: '#1A1F24',
  muted: '#66707A',
  plum: '#0F766E',
  plumSoft: '#CCFBF1',
  blush: '#F4E6E2',
  sage: '#0F766E',
  card: '#FFFFFF',
  line: '#E6E2DC',
  warn: '#B45309',
  danger: '#B42318',
  ok: '#0F766E',
  sky: '#E8F1F4',
  lilac: '#EEEAF4',
  mint: '#E7F5F0',
  peach: '#F6EBDF',
  tab: '#12171C',
  tabMuted: '#8B95A1',
  hero: '#12202A',
}

const shadow = Platform.select({
  web: { boxShadow: '0 8px 24px rgba(18, 23, 28, 0.06)' },
  default: {
    shadowColor: '#12171C',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
})

/** Shared layout styles. */
export const ui = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 44,
    gap: 16,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.plum,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  muted: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  button: {
    backgroundColor: colors.plum,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    backgroundColor: colors.card,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
  },
})
