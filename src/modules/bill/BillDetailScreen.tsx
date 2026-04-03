// src/modules/bill/BillDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import { useBillStore } from "./store";
import BillItemRow from "./components/BillItemRow";

const BillDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const billId: number = route.params?.billId;
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const { currentBill, currentItems, loading, getById, updatePaymentStatus } =
    useBillStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (billId) {
      getById(billId);
    }
  }, [billId, getById]);

  if (loading && !currentBill) {
    return <Loader />;
  }

  if (!currentBill) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.textSecondary }}>Bill not found.</Text>
      </View>
    );
  }

  const formatMoney = (v: any) => {
    const n = Number(v || 0);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  };

  const setStatus = async (status: "Unpaid" | "Paid" | "PartiallyPaid") => {
    try {
      setSaving(true);
      const updated = await updatePaymentStatus(currentBill.bill_id, status);
      setSaving(false);

      if (!updated) {
        Alert.alert("Error", "Failed to update payment status");
        return;
      }

      Alert.alert("Success", `Bill marked as ${status}`);
    } catch (e: any) {
      setSaving(false);
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to update status"
      );
    }
  };

  const StatusButton = ({
    title,
    value,
  }: {
    title: string;
    value: "Unpaid" | "Paid" | "PartiallyPaid";
  }) => {
    const active = currentBill.payment_status === value;

    return (
      <TouchableOpacity
        onPress={() => setStatus(value)}
        disabled={saving}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 8,
          marginRight: value !== "PartiallyPaid" ? 8 : 0,
          backgroundColor: active
            ? colors.primary
            : colors.surface || "#F3F4F6",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: active ? "#fff" : colors.text,
            fontSize: 12,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 22,
          fontWeight: "700",
        }}
      >
        Bill #{currentBill.bill_no}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 4,
          fontSize: 13,
        }}
      >
        {currentBill.bill_type} • {currentBill.payment_status}
      </Text>

      <View
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 10,
          backgroundColor: colors.surface || "#F9FAFB",
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Booking ID: {currentBill.booking_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Guest ID: {currentBill.guest_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Room ID: {currentBill.room_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Folio ID: {currentBill.folio_id ?? "-"}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 6,
          }}
        >
          Items
        </Text>

        {currentItems.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            No items found for this bill.
          </Text>
        ) : (
          currentItems.map((item) => (
            <BillItemRow key={item.bill_item_id} item={item} />
          ))
        )}
      </View>

      <View
        style={{
          marginTop: 16,
          paddingTop: 10,
          borderTopWidth: 0.5,
          borderTopColor: colors.border || "#E5E7EB",
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Gross: ₹ {formatMoney(currentBill.gross_amount)}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}>
          Discount: ₹ {formatMoney(currentBill.discount_amount)}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}>
          Tax: ₹ {formatMoney(currentBill.tax_amount)}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}>
          Round off: ₹ {formatMoney(currentBill.round_off)}
        </Text>

        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "800",
            marginTop: 8,
          }}
        >
          Net Amount: ₹ {formatMoney(currentBill.net_amount)}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Payment Status
        </Text>

        <View style={{ flexDirection: "row" }}>
          <StatusButton title="Unpaid" value="Unpaid" />
          <StatusButton title="Paid" value="Paid" />
          <StatusButton title="Partial" value="PartiallyPaid" />
        </View>
      </View>
    </ScrollView>
  );
};

export default BillDetailScreen;