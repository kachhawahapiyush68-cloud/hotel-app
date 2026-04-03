// src/modules/bill/components/BillItemRow.tsx
import React from "react";
import { View, Text } from "react-native";
import { BillItem } from "../../../api/billApi";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  item: BillItem;
};

const BillItemRow: React.FC<Props> = ({ item }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const money = (v: any) => {
    const n = Number(v || 0);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border || "#E5E7EB",
      }}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {item.source_type || "Item"}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          Product ID: {item.product_id}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Qty: {item.qty} × {money(item.rate)}
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          ₹ {money(item.amount)}
        </Text>
      </View>
    </View>
  );
};

export default BillItemRow;