// src/modules/bill/BillFromKotScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Alert, Text, ScrollView } from "react-native";
import { useThemeStore } from "../../store/themeStore";
import AppButton from "../../shared/components/AppButton";
import AppInput from "../../shared/components/AppInput";
import { useBillStore } from "./store";
import { useRoute, useNavigation } from "@react-navigation/native";

const BillFromKotScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { createFromKot } = useBillStore();

  const booking_id: number | undefined = route.params?.bookingId;
  const folio_id: number | undefined = route.params?.folioId;
  const room_id: number | undefined = route.params?.roomId;
  const guest_id: number | undefined = route.params?.guestId;

  const [billType, setBillType] = useState<string>("Room");
  const [grossAmount, setGrossAmount] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [taxAmount, setTaxAmount] = useState<string>("0");
  const [roundOff, setRoundOff] = useState<string>("0");
  const [saving, setSaving] = useState(false);

  const netAmount = useMemo(() => {
    const gross = Number(grossAmount || 0);
    const discount = Number(discountAmount || 0);
    const tax = Number(taxAmount || 0);
    const round = Number(roundOff || 0);
    const total = gross - discount + tax + round;
    return Number.isNaN(total) ? 0 : total;
  }, [grossAmount, discountAmount, taxAmount, roundOff]);

  const handleCreate = async () => {
    if (!booking_id) {
      Alert.alert("Error", "Booking ID is required.");
      return;
    }

    if (!grossAmount || Number(grossAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid gross amount.");
      return;
    }

    try {
      setSaving(true);

      const res = await createFromKot({
        kot_ids: [],
        bill_type: billType,
        booking_id,
        folio_id,
        room_id,
        guest_id,
        gross_amount: Number(grossAmount || 0),
        discount_amount: Number(discountAmount || 0),
        tax_amount: Number(taxAmount || 0),
        round_off: Number(roundOff || 0),
        net_amount: Number(netAmount || 0),
      });

      setSaving(false);

      if (!res) {
        Alert.alert("Error", "Failed to create bill");
        return;
      }

      Alert.alert("Success", "Booking bill created successfully", [
        {
          text: "Open Bill",
          onPress: () =>
            navigation.replace("BillDetail", { billId: res.bill.bill_id }),
        },
      ]);
    } catch (e: any) {
      setSaving(false);
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to create bill"
      );
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 28,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Create Booking Bill
      </Text>

      <View
        style={{
          padding: 12,
          borderRadius: 10,
          backgroundColor: colors.surface || "#F9FAFB",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Booking ID: {booking_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Guest ID: {guest_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Room ID: {room_id ?? "-"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
          Folio ID: {folio_id ?? "-"}
        </Text>
      </View>

      <AppInput
        label="Bill Type"
        value={billType}
        onChangeText={setBillType}
        placeholder="Room / Restaurant / Other"
      />

      <AppInput
        label="Gross Amount"
        value={grossAmount}
        onChangeText={setGrossAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <AppInput
        label="Discount Amount"
        value={discountAmount}
        onChangeText={setDiscountAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <AppInput
        label="Tax Amount"
        value={taxAmount}
        onChangeText={setTaxAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <AppInput
        label="Round Off"
        value={roundOff}
        onChangeText={setRoundOff}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <View
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 10,
          backgroundColor: colors.surface || "#F3F4F6",
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Bill total preview
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "800",
            marginTop: 6,
          }}
        >
          ₹ {netAmount.toFixed(2)}
        </Text>
      </View>

      <View style={{ marginTop: 18 }}>
        <AppButton
          title={saving ? "Creating..." : "Create Bill"}
          onPress={handleCreate}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
};

export default BillFromKotScreen;