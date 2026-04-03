import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BillItem } from "../types";
import { formatNumber } from "../../../shared/utils/number";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  item: BillItem;
  index: number;
};

const BillItemRow: React.FC<Props> = ({ item, index }) => {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {index + 1}. {item.product_name || `Product #${item.product_id}`}
        </Text>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>
          ₹ {formatNumber(item.amount || 0, 2)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          Qty: {formatNumber(item.qty || 0, 2)}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          Rate: ₹ {formatNumber(item.rate || 0, 2)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          Source: {item.source_type}
        </Text>
        {item.source_ref_id ? (
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            Ref: {item.source_ref_id}
          </Text>
        ) : null}
      </View>

      {item.unit ? (
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          Unit: {item.unit}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  meta: {
    marginRight: 14,
    fontSize: 13,
  },
});

export default BillItemRow;