import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'

import { colors, ui } from '@/src/theme/ui'

export type IconName = keyof typeof Ionicons.glyphMap

type AppIconProps = {
  name: IconName
  size?: number
  color?: string
}

/**
 * Shared Ionicons wrapper for consistent icon styling.
 * @param name Ionicons glyph name.
 * @param size Pixel size. Defaults to 20.
 * @param color Icon color. Defaults to navy ink.
 */
export const AppIcon = ({ name, size = 20, color = colors.ink }: AppIconProps) => (
  <Ionicons name={name} size={size} color={color} />
)

type IconChipProps = {
  name: IconName
  tone?: 'mauve' | 'sky' | 'navy'
}

/**
 * Soft rounded chip used next to section titles and metric cards.
 * @param name Ionicons glyph name.
 * @param tone Background accent family.
 */
export const IconChip = ({ name, tone = 'mauve' }: IconChipProps) => {
  const background =
    tone === 'sky' ? colors.sky : tone === 'navy' ? colors.ink : colors.plumSoft
  const iconColor = tone === 'navy' ? '#FFFFFF' : colors.ink
  return (
    <View style={[ui.iconChip, { backgroundColor: background }]}>
      <AppIcon name={name} size={18} color={iconColor} />
    </View>
  )
}
