// src/shared/components/AppButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

type Props = { title: string; onPress: () => void; loading?: boolean };

export default function AppButton({ title, onPress, loading }: Props) {
  const { theme } = useThemeStore();
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: { color: '#fff', fontWeight: '600' },
});
