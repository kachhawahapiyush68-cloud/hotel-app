// src/shared/components/AppButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

type AppButtonVariant = 'solid' | 'outline';
type AppButtonSize = 'normal' | 'small';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  variant?: AppButtonVariant;
  size?: AppButtonSize;
};

const AppButton: React.FC<Props> = ({
  title,
  onPress,
  loading,
  disabled,
  style,
  variant = 'solid',
  size = 'normal',
}) => {
  const { theme } = useThemeStore();
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';
  const isSmall = size === 'small';

  const backgroundColor = isOutline ? 'transparent' : theme.colors.primary;
  const borderColor = theme.colors.primary;
  const textColor = isOutline ? theme.colors.primary : theme.colors.surface;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.7 : 1,
          paddingVertical: isSmall ? 6 : 10,
          paddingHorizontal: isSmall ? 10 : 16,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize: isSmall ? 13 : 15 },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '600' },
});

export default AppButton;
