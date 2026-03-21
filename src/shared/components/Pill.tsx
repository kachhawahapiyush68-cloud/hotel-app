// src/shared/components/Pill.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const Pill: React.FC<Props> = ({ label, active, onPress, style }) => {
  const { theme } = useThemeStore();

  const bg = active ? theme.colors.primary : 'transparent';
  const border = active ? theme.colors.primary : theme.colors.border;
  const color = active ? theme.colors.surface : theme.colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Pill;
