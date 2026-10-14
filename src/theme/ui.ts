import { StyleSheet } from 'react-native'

/** Shared palette for FacePal screens. */
export const colors = {
  bg: '#FFF8F3',
  ink: '#241820',
  muted: '#6E5A62',
  plum: '#5C3D4E',
  blush: '#F3D2C7',
  sage: '#6E8B74',
  card: '#FFFFFF',
  line: '#E7D9D2',
  warn: '#8E3B3B',
  ok: '#2F6B4F',
}

/** Shared layout styles. */
export const ui = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  button: {
    backgroundColor: colors.plum,
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFF8F3',
    fontSize: 16,
    fontWeight: '600',
  },
  ghost: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.plum,
  },
  ghostText: {
    color: colors.plum,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    color: colors.warn,
    fontSize: 14,
  },
})
