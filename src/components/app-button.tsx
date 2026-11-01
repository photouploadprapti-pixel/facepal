import { Pressable, Text, View } from 'react-native'

import { AppIcon, type IconName } from '@/src/components/app-icon'
import { colors, ui } from '@/src/theme/ui'

type AppButtonProps = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
  icon?: IconName
}

/**
 * Primary or secondary action button with optional leading icon.
 * @param label Visible button text.
 * @param onPress Tap handler.
 * @param variant Filled navy or outlined mauve style.
 * @param disabled When true, the control does not fire.
 * @param icon Optional Ionicons glyph shown before the label.
 */
export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
}: AppButtonProps) => (
  <Pressable
    style={[variant === 'primary' ? ui.button : ui.ghost, disabled ? { opacity: 0.55 } : null]}
    disabled={disabled}
    onPress={onPress}
  >
    {icon ? (
      <AppIcon
        name={icon}
        size={18}
        color={variant === 'primary' ? '#FFFFFF' : colors.ink}
      />
    ) : null}
    <Text style={variant === 'primary' ? ui.buttonText : ui.ghostText}>{label}</Text>
  </Pressable>
)

type BrandMarkProps = {
  size?: number
}

/**
 * Simple FacePal mark used on auth and home headers.
 * @param size Outer circle diameter.
 */
export const BrandMark = ({ size = 44 }: BrandMarkProps) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      backgroundColor: colors.midnight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.plum,
    }}
  >
    <AppIcon name="happy-outline" size={Math.round(size * 0.46)} color={colors.skyBlue} />
  </View>
)
