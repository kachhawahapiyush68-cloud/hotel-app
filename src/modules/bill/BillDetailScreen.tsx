import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { BillDetailResponse, BillPaymentStatus } from "./types";
import { deleteBill, fetchBillDetail, updateBillPaymentStatus } from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton from "../../shared/components/AppButton";
import SelectModal, { SelectItem } from "../../shared/components/SelectModal";
import BillItemRow from "./components/BillItemRow";
import { formatDateTime } from "../../shared/utils/date";
import { formatNumber } from "../../shared/utils/number";
import { useThemeStore } from "../../store/themeStore";

type ParamList = {
  BillDetail: {
    billId: number;
  };
};

const PAYMENT_OPTIONS: SelectItem[] = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Partially Paid", value: "PartiallyPaid" },
  { label: "Paid", value: "Paid" },
];

const BillDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, "BillDetail">>();
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const billId = route.params.billId;

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<BillDetailResponse | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    load();
  }, [billId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchBillDetail(billId);
      setDetail(res);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const guestName = useMemo(() => {
    const bill = detail?.bill;
    if (!bill) return "";
    return bill.first_name || bill.last_name
      ? `${bill.first_name || ""} ${bill.last_name || ""}`.trim()
      : "";
  }, [detail]);

  const onSelectPaymentStatus = async (item: SelectItem) => {
    try {
      setPaymentModalVisible(false);
      setLoading(true);
      await updateBillPaymentStatus(billId, item.value as BillPaymentStatus);
      await load();
      Alert.alert("Success", "Payment status updated");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Delete Bill", "Are you sure you want to delete this bill?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteBill(billId);
            Alert.alert("Deleted", "Bill deleted successfully");
            navigation.goBack();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to delete bill");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading && !detail) {
    return <Loader />;
  }

  if (!detail) return null;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionTitle
          title="Bill Detail"
          subtitle={detail.bill.bill_no}
        />

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.row, { color: theme.colors.text }]}>
            Bill Type: {detail.bill.bill_type}
          </Text>
          <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
            Date: {detail.bill.bill_datetime ? formatDateTime(detail.bill.bill_datetime) : "-"}
          </Text>
          <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
            Payment Status: {detail.bill.payment_status || "Unpaid"}
          </Text>

          {guestName ? (
            <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
              Guest: {guestName}
            </Text>
          ) : null}

          {detail.bill.room_no ? (
            <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
              Room: {detail.bill.room_no}
            </Text>
          ) : null}

          {detail.bill.folio_no ? (
            <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
              Folio: {detail.bill.folio_no}
            </Text>
          ) : null}

          {detail.bill.reservation_no ? (
            <Text style={[styles.row, { color: theme.colors.textSecondary }]}>
              Booking: {detail.bill.reservation_no}
            </Text>
          ) : null}

          <View style={styles.amountWrap}>
            <Text style={[styles.amountLine, { color: theme.colors.textSecondary }]}>
              Gross: ₹ {formatNumber(detail.bill.gross_amount || 0, 2)}
            </Text>
            <Text style={[styles.amountLine, { color: theme.colors.textSecondary }]}>
              Discount: ₹ {formatNumber(detail.bill.discount_amount || 0, 2)}
            </Text>
            <Text style={[styles.amountLine, { color: theme.colors.textSecondary }]}>
              Tax: ₹ {formatNumber(detail.bill.tax_amount || 0, 2)}
            </Text>
            <Text style={[styles.amountLine, { color: theme.colors.textSecondary }]}>
              Round Off: ₹ {formatNumber(detail.bill.round_off || 0, 2)}
            </Text>
            <Text style={[styles.netAmount, { color: theme.colors.primary }]}>
              Net Amount: ₹ {formatNumber(detail.bill.net_amount || 0, 2)}
            </Text>
          </View>
        </View>

        <SectionTitle title="Items" />

        {detail.items.map((item, index) => (
          <BillItemRow key={item.bill_item_id || index} item={item} index={index} />
        ))}

        <AppButton
          title="Update Payment Status"
          onPress={() => setPaymentModalVisible(true)}
          style={{ marginBottom: 10 }}
        />

        <AppButton
          title="Delete Bill"
          variant="outline"
          onPress={onDelete}
        />
      </ScrollView>

      <SelectModal
        visible={paymentModalVisible}
        title="Update Payment Status"
        data={PAYMENT_OPTIONS}
        onSelect={onSelectPaymentStatus}
        onClose={() => setPaymentModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, padding: 16 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    fontSize: 14,
    marginBottom: 6,
  },
  amountWrap: {
    marginTop: 10,
  },
  amountLine: {
    fontSize: 14,
    marginBottom: 4,
  },
  netAmount: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default BillDetailScreen;