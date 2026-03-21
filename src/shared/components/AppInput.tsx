// src/shared/components/AppInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export default function AppInput(props: TextInputProps) {
  const { theme } = useThemeStore();
  return (
    <TextInput
      placeholderTextColor={theme.colors.textSecondary}
      style={[
        styles.input,
        {
          color: theme.colors.text,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
});
