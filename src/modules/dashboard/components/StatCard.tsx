// src/modules/dashboard/components/StatCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  label: string;
  value: number;
};

export const StatCard: React.FC<Props> = ({ label, value }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
});
