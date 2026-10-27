import { Pressable, Text } from 'react-native'

import { ui } from '@/src/theme/ui'

type AppButtonProps = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}

/**
 * Primary or secondary action button with consistent professional styling.
 * @param label Visible button text.
 * @param onPress Tap handler.
 * @param variant Filled teal or outlined card style.
 * @param disabled When true, the control does not fire.
 */
export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: AppButtonProps) => (
  <Pressable
    style={[variant === 'primary' ? ui.button : ui.ghost, disabled ? { opacity: 0.55 } : null]}
    disabled={disabled}
    onPress={onPress}
  >
    <Text style={variant === 'primary' ? ui.buttonText : ui.ghostText}>{label}</Text>
  </Pressable>
)
