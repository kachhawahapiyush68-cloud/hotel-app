import React, { useMemo } from "react";
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
  const colors = theme.colors;

  const resolvedChargeType = item.charge_type || null;

  const displayName = useMemo(() => {
    const source = String(item.source_type || "").toUpperCase();
    const chargeType = String(resolvedChargeType || "").toUpperCase();

    if (source === "ROOM_POSTING") {
      if (chargeType === "ROOM_RENT") return "Room Rent";
      if (chargeType === "EXTRA_CHARGE") return "Extra Charge";
      if (resolvedChargeType) return resolvedChargeType;
      return "Room Posting";
    }

    if (source === "KOT") {
      if (item.product_name) return item.product_name;
      return `KOT Item #${item.product_id}`;
    }

    if (item.product_name) return item.product_name;
    return `Product #${item.product_id}`;
  }, [item, resolvedChargeType]);

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
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          {index + 1}. {displayName}
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          ₹ {formatNumber(item.amount || 0, 2)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Qty: {formatNumber(item.qty || 0, 2)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Rate: ₹ {formatNumber(item.rate || 0, 2)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Source: {item.source_type}
        </Text>
        {item.source_ref_id ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Ref: {item.source_ref_id}
          </Text>
        ) : null}
      </View>

      {item.unit ? (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Unit: {item.unit}
        </Text>
      ) : null}

      {resolvedChargeType ? (
        <Text style={[styles.meta, { color: colors.textSecondary, marginTop: 2 }]}>
          Charge Type: {resolvedChargeType}
        </Text>
      ) : null}

      {item.posting_date ? (
        <Text style={[styles.meta, { color: colors.textSecondary, marginTop: 2 }]}>
          Posting Date: {item.posting_date}
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