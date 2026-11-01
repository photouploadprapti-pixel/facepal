import { Platform, StyleSheet } from 'react-native'

/**
 * Exact swatches from the brand palette board.
 * #0E1B48 navy · #C18DB4 mauve · #E2CADB blush · #87A7D0 sky · #27425D slate · #0E1F2F midnight
 */
export const colors = {
  bg: '#E2CADB',
  bgSoft: '#F3E6EE',
  ink: '#0E1B48',
  muted: '#27425D',
  plum: '#C18DB4',
  plumSoft: '#E2CADB',
  blush: '#E2CADB',
  sage: '#87A7D0',
  card: 'rgba(255,255,255,0.92)',
  line: 'rgba(193,141,180,0.45)',
  warn: '#B45309',
  danger: '#9F1239',
  ok: '#27425D',
  sky: 'rgba(135,167,208,0.28)',
  lilac: 'rgba(193,141,180,0.22)',
  mint: 'rgba(135,167,208,0.22)',
  peach: 'rgba(226,202,219,0.75)',
  tab: '#0E1B48',
  tabMuted: '#87A7D0',
  hero: '#0E1F2F',
  skyBlue: '#87A7D0',
  slate: '#27425D',
  midnight: '#0E1F2F',
}

const shadow = Platform.select({
  web: { boxShadow: '0 12px 30px rgba(14, 27, 72, 0.12)' },
  default: {
    shadowColor: '#0E1B48',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
})

/** Shared layout styles. */
export const ui = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgSoft,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 44,
    gap: 16,
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.plum,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    backgroundColor: colors.midnight,
    borderRadius: 999,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    ...shadow,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.plum,
    flexDirection: 'row',
    gap: 8,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.plumSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
})
