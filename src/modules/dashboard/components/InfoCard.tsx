// src/modules/dashboard/components/InfoCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  title: string;
  value?: number;
  valueText?: string;        // used when you want formatted value like revenue
  subtitle?: string;
  pillText?: string;
  pillColor?: string;
  color?: string;
};

export const InfoCard: React.FC<Props> = ({
  title,
  value,
  valueText,
  subtitle,
  pillText,
  pillColor,
  color,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title}
      </Text>

      <Text style={[styles.value, { color: color || colors.primary }]}>
        {valueText ?? value ?? 0}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}

      {pillText ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: pillColor || colors.primarySoft },
          ]}
        >
          <Text style={[styles.pillText, { color: color || colors.primary }]}>
            {pillText}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
