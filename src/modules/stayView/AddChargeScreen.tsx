import React, { useMemo, useState } from "react";
import { ScrollView, Alert, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppInput from "../../shared/components/AppInput";
import AppButton from "../../shared/components/AppButton";
import { postingApi } from "../../api/postingApi";
import { useThemeStore } from "../../store/themeStore";
import { useBookingStore } from "../booking/store";
import {
  getBookingGuestName,
  getBookingRoomLabel,
  getBookingMetaLine,
} from "../../api/bookingApi";
import { formatDateTime } from "../../shared/utils/date";

const AddChargeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const { currentBooking, currentFolio } = useBookingStore();

  const [chargeType, setChargeType] = useState("EXTRA_CHARGE");
  const [amount, setAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [loading, setLoading] = useState(false);

  const amt = Number(amount) || 0;
  const tax = Number(taxAmount || 0) || 0;
  const total = useMemo(() => amt + Math.max(tax, 0), [amt, tax]);

  const resolvedFolioId =
    Number(currentFolio?.folio_id || 0) ||
    Number((currentBooking as any)?.folio_id || 0) ||
    0;

  const resolvedFolioNo =
    currentFolio?.folio_no ||
    (currentBooking as any)?.folio_no ||
    (resolvedFolioId ? `FOL-${resolvedFolioId}` : "-");

  const guestName = getBookingGuestName(currentBooking || undefined);
  const roomLabel = getBookingRoomLabel(currentBooking || undefined);
  const metaLine = getBookingMetaLine(currentBooking || undefined);

  const handleSave = async () => {
    if (loading) return;

    if (!currentBooking?.booking_id) {
      Alert.alert("Error", "Booking not selected.");
      return;
    }

    if (!resolvedFolioId) {
      Alert.alert("Error", "Folio not found for current stay.");
      return;
    }

    if (String(currentBooking.status || "") !== "CheckedIn") {
      Alert.alert("Not allowed", "Charges can be added only for checked-in stay.");
      return;
    }

    if (!chargeType.trim()) {
      Alert.alert("Validation", "Charge type is required.");
      return;
    }

    if (!amt || amt <= 0) {
      Alert.alert("Validation", "Enter valid amount.");
      return;
    }

    if (tax < 0) {
      Alert.alert("Validation", "Tax amount cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      await postingApi.createExtraCharge({
        booking_id: currentBooking.booking_id,
        charge_type: chargeType.trim().toUpperCase(),
        amount: amt,
        tax_amount: tax > 0 ? tax : 0,
        // posting_date and company_id can still be added here if needed
      });

      Alert.alert("Success", "Charge posted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not save charge."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentBooking) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
          No active stay selected. Open a stay first, then add charge.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Add extra charge
      </Text>

      <View
        style={{
          marginBottom: 12,
          padding: 12,
          borderRadius: 12,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 4,
          }}
        >
          {guestName}
        </Text>

        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          {roomLabel}
        </Text>

        {!!metaLine && (
          <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
            {metaLine}
          </Text>
        )}

        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Folio: {resolvedFolioNo}
        </Text>

        <Text style={{ color: colors.textSecondary }}>
          Stay: {formatDateTime(currentBooking.check_in_datetime)} →{" "}
          {formatDateTime(currentBooking.check_out_datetime)}
        </Text>
      </View>

      <AppInput
        label="Charge Type"
        value={chargeType}
        onChangeText={setChargeType}
        placeholder="EXTRA_CHARGE / LAUNDRY / MINIBAR"
        autoCapitalize="characters"
        containerStyle={{ marginBottom: 12 }}
      />

      <AppInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
        containerStyle={{ marginBottom: 12 }}
      />

      <AppInput
        label="Tax Amount"
        value={taxAmount}
        onChangeText={setTaxAmount}
        keyboardType="numeric"
        placeholder="0"
        containerStyle={{ marginBottom: 8 }}
      />

      <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
        Total: ₹ {total.toFixed(2)}
      </Text>

      <AppButton
        title={loading ? "Saving..." : "Save Charge"}
        onPress={handleSave}
        disabled={loading}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
};

export default AddChargeScreen;