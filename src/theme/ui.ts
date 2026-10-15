import { Platform, StyleSheet } from 'react-native'

/** Palette borrowed from a bright, rounded mobile look. */
export const colors = {
  bg: '#F4F2F6',
  ink: '#1C1424',
  muted: '#6E6578',
  plum: '#FF3D8A',
  blush: '#FFD4E8',
  sage: '#2FBE86',
  card: '#FFFFFF',
  line: '#EFE8F3',
  warn: '#E23B6A',
  ok: '#149A68',
  sky: '#D9F4FF',
  lilac: '#E7DEFF',
  mint: '#D9F8EA',
  peach: '#FFE4D2',
  tab: '#24182E',
  tabMuted: '#C8B8D4',
}

const shadow = Platform.select({
  web: { boxShadow: '0 10px 30px rgba(36, 24, 46, 0.08)' },
  default: {
    shadowColor: '#24182E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.6,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.ink,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 18,
    gap: 10,
    ...shadow,
  },
  button: {
    backgroundColor: colors.plum,
    borderRadius: 999,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    ...shadow,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  ghost: {
    backgroundColor: colors.card,
    borderRadius: 999,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    ...shadow,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    ...shadow,
  },
  error: {
    color: colors.warn,
    fontSize: 14,
    fontWeight: '600',
  },
})
