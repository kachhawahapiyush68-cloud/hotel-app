// ============================================================
// src/modules/bill/components/BillItemRow.tsx
// ============================================================

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  BillItem,
  getChargeTypeLabel,
  DISPLAY_CATEGORY_COLOR,
} from "../types";
import { formatNumber } from "../../../shared/utils/number";
import { formatDateTime } from "../../../shared/utils/date";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  item: BillItem;
  index: number;
};

const BillItemRow: React.FC<Props> = ({ item }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const displayName = useMemo(() => {
    const source = String(item.source_type || "").toUpperCase();

    if (source === "KOT") {
      return item.product_name || `KOT Item #${item.product_id}`;
    }

    if (source === "ROOM_POSTING") {
      if (item.charge_type) return getChargeTypeLabel(item.charge_type);
      return "Room Posting";
    }

    if (source === "MANUAL" && item.description) {
      return item.description;
    }

    if (item.product_name) return item.product_name;
    return `Item #${item.product_id}`;
  }, [item]);

  const category = String(item.display_category || "CHARGE").toUpperCase();
  const catColor = DISPLAY_CATEGORY_COLOR[category] ?? "#6B7280";

  const catLabel =
    category === "CHARGE"
      ? "Charge"
      : category === "DISCOUNT"
      ? "Discount"
      : category === "PAYMENT"
      ? "Payment"
      : category;

  const amountColor =
    category === "PAYMENT"
      ? "#2563EB"
      : category === "DISCOUNT"
      ? "#D98E04"
      : colors.primary;

  const amountPrefix =
    category === "PAYMENT" || category === "DISCOUNT" ? "- ₹ " : "₹ ";

  const qty = Number(item.qty || 0);
  const rate = Number(item.rate || 0);
  const amount = Number(item.amount || 0);
  const tax = Number(item.tax_amount || 0);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: catColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <Text style={[styles.title, { color: colors.text }]}>
            {displayName}
          </Text>

          {!!item.charge_type && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Type: {getChargeTypeLabel(item.charge_type)}
            </Text>
          )}

          {!!item.posting_date && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Date: {formatDateTime(item.posting_date)}
            </Text>
          )}

          {item.product_code ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Code: {item.product_code}
            </Text>
          ) : null}

          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Qty: {formatNumber(qty, 2)} × ₹ {formatNumber(rate, 2)}
          </Text>

          {tax > 0 ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Tax: ₹ {formatNumber(tax, 2)}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightCol}>
          <View style={[styles.badge, { backgroundColor: `${catColor}18` }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>
              {catLabel}
            </Text>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}
            {formatNumber(amount, 2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    marginBottom: 3,
  },
  rightCol: {
    alignItems: "flex-end",
    minWidth: 100,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default BillItemRow;