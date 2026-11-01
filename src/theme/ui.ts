import { Platform, StyleSheet } from 'react-native'

/**
 * Palette from the Face Health UI preview: navy, mauve, soft pink, sky blue.
 */
export const colors = {
  bg: '#F4E8EE',
  ink: '#0E1B48',
  muted: '#27425D',
  plum: '#C18DB4',
  plumSoft: '#E2CAD8',
  blush: '#E2CAD8',
  sage: '#87A7D0',
  card: '#FFFFFF',
  line: '#D8BDD2',
  warn: '#B45309',
  danger: '#9F1239',
  ok: '#27425D',
  sky: '#D6E3F1',
  lilac: '#EAD6E4',
  mint: '#E2CAD8',
  peach: '#F0DCE6',
  tab: '#0E1B48',
  tabMuted: '#87A7D0',
  hero: '#0E1F2F',
  skyBlue: '#87A7D0',
  slate: '#27425D',
}

const shadow = Platform.select({
  web: { boxShadow: '0 10px 28px rgba(14, 27, 72, 0.10)' },
  default: {
    shadowColor: '#0E1B48',
    shadowOpacity: 0.1,
    shadowRadius: 14,
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
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    fontWeight: '500',
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
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.plum,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  button: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...shadow,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.plum,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
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
