// src/modules/dashboard/components/SummaryRow.tsx
import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export const SummaryRow: React.FC<Props> = ({ left, right }) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>{left}</View>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
  right: {
    marginLeft: 16,
  },
});
