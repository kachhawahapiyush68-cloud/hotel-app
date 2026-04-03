import React, { useState } from "react";
import { ScrollView, Alert, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppInput from "../../shared/components/AppInput";
import AppButton from "../../shared/components/AppButton";
import { postingApi } from "../../api/postingApi";
import { useThemeStore } from "../../store/themeStore";
import { useBookingStore } from "../booking/store";

const AddChargeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const { currentBooking, currentFolio } = useBookingStore();

  const [chargeType, setChargeType] = useState("EXTRA_CHARGE");
  const [amount, setAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;

    const amt = Number(amount);
    const tax = Number(taxAmount || 0);

    if (!currentBooking?.booking_id) {
      Alert.alert("Error", "Booking not selected");
      return;
    }

    if (!chargeType.trim()) {
      Alert.alert("Validation", "Charge type is required");
      return;
    }

    if (!amt || amt <= 0) {
      Alert.alert("Validation", "Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      const res = await postingApi.createExtraCharge({
        booking_id: currentBooking.booking_id,
        charge_type: chargeType.trim(),
        amount: amt,
        tax_amount: tax > 0 ? tax : 0,
      });

      Alert.alert(
        "Success",
        `Charge posted successfully\nPosting ID: ${res.posting_id}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not save charge"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentBooking || !currentFolio) {
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

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Booking ID: {currentBooking.booking_id}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Room ID: {currentBooking.room_id}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Folio: {currentFolio.folio_no} (ID: {currentFolio.folio_id})
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
        containerStyle={{ marginBottom: 12 }}
      />

      <AppButton
        title={loading ? "Please wait..." : "Save Charge"}
        onPress={handleSave}
        disabled={loading}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
};

export default AddChargeScreen;