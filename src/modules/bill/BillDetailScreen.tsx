import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  BillDetailResponse,
  BillPaymentStatus,
  MarkPaidPayload,
  toUiBillPaymentStatus,
} from "./types";
import {
  deleteBill,
  fetchBillDetail,
  markBillPaid,
  updateBillPaymentStatus,
} from "./api";
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

const DEFAULT_LEDGER_IDS = {
  ledger_cash_bank_id: 1,
  ledger_receivable_id: 2,
  ledger_tax_id: 4,
};

const BillDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, "BillDetail">>();
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const billId = route.params.billId;

  const [loading, setLoading] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [detail, setDetail] = useState<BillDetailResponse | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchBillDetail(billId);
      setDetail(res);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load bill"
      );
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    load();
  }, [load]);

  const guestName = useMemo(() => {
    const bill = detail?.bill;
    if (!bill) return "";
    if (bill.first_name || bill.last_name) {
      return `${bill.first_name || ""} ${bill.last_name || ""}`.trim();
    }
    return "";
  }, [detail]);

  const uiPaymentStatus = useMemo(() => {
    return toUiBillPaymentStatus(detail?.bill?.payment_status);
  }, [detail]);

  const isPaid = uiPaymentStatus === "Paid";

  const onSelectPaymentStatus = async (item: SelectItem) => {
    if (loading) return;

    try {
      setPaymentModalVisible(false);
      setLoading(true);
      await updateBillPaymentStatus(billId, item.value as BillPaymentStatus);
      const refreshed = await fetchBillDetail(billId);
      setDetail(refreshed);
      Alert.alert("Success", "Payment status updated");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to update status"
      );
    } finally {
      setLoading(false);
    }
  };

  const onMarkPaid = async () => {
    if (!detail?.bill || markPaidLoading) return;

    const netAmount = Number(detail.bill.net_amount || 0);
    const taxAmount = Number(detail.bill.tax_amount || 0);

    if (netAmount <= 0) {
      Alert.alert("Not allowed", "Bill amount must be greater than zero.");
      return;
    }

    Alert.alert(
      "Mark Paid",
      "This will mark the bill as paid and create receipt voucher posting. Continue?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setMarkPaidLoading(true);

              const payload: MarkPaidPayload = {
                amount: netAmount,
                payment_mode: "CASH",
                ledger_cash_bank_id: DEFAULT_LEDGER_IDS.ledger_cash_bank_id,
                ledger_receivable_id: DEFAULT_LEDGER_IDS.ledger_receivable_id,
                ...(taxAmount > 0
                  ? { ledger_tax_id: DEFAULT_LEDGER_IDS.ledger_tax_id }
                  : {}),
              };

              const res = await markBillPaid(billId, payload);

              if (res.bill) {
                setDetail((prev) =>
                  prev
                    ? {
                        ...prev,
                        bill: res.bill!,
                      }
                    : prev
                );
              } else {
                await load();
              }

              const voucherText =
                res.vouchers?.length > 0
                  ? res.vouchers
                      .map((v) => `${v.voucher_type}: ${v.voucher_no}`)
                      .join("\n")
                  : "Receipt voucher posted successfully";

              Alert.alert("Success", `Bill marked as paid.\n${voucherText}`);
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message ||
                  e?.message ||
                  "Failed to mark bill as paid"
              );
            } finally {
              setMarkPaidLoading(false);
            }
          },
        },
      ]
    );
  };

  const onDelete = () => {
    if (loading || markPaidLoading) return;

    Alert.alert("Delete Bill", "Are you sure you want to delete this bill?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteBill(billId);
            Alert.alert("Deleted", "Bill deleted successfully", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || e?.message || "Failed to delete bill"
            );
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

  if (!detail) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.textSecondary }}>Bill not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Bill Detail" subtitle={detail.bill.bill_no} />

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.row, { color: colors.text }]}>
            Bill Type: {detail.bill.bill_type}
          </Text>

          <Text style={[styles.row, { color: colors.textSecondary }]}>
            Date:{" "}
            {detail.bill.bill_datetime
              ? formatDateTime(detail.bill.bill_datetime)
              : "-"}
          </Text>

          <Text style={[styles.row, { color: colors.textSecondary }]}>
            Payment Status: {uiPaymentStatus}
          </Text>

          {guestName ? (
            <Text style={[styles.row, { color: colors.textSecondary }]}>
              Guest: {guestName}
            </Text>
          ) : null}

          {detail.bill.room_no ? (
            <Text style={[styles.row, { color: colors.textSecondary }]}>
              Room: {detail.bill.room_no}
            </Text>
          ) : null}

          {detail.bill.folio_no ? (
            <Text style={[styles.row, { color: colors.textSecondary }]}>
              Folio: {detail.bill.folio_no}
            </Text>
          ) : null}

          {detail.bill.reservation_no ? (
            <Text style={[styles.row, { color: colors.textSecondary }]}>
              Booking: {detail.bill.reservation_no}
            </Text>
          ) : null}

          <View style={styles.amountWrap}>
            <Text style={[styles.amountLine, { color: colors.textSecondary }]}>
              Gross: ₹ {formatNumber(detail.bill.gross_amount || 0, 2)}
            </Text>

            <Text style={[styles.amountLine, { color: colors.textSecondary }]}>
              Discount: ₹ {formatNumber(detail.bill.discount_amount || 0, 2)}
            </Text>

            <Text style={[styles.amountLine, { color: colors.textSecondary }]}>
              Tax: ₹ {formatNumber(detail.bill.tax_amount || 0, 2)}
            </Text>

            <Text style={[styles.amountLine, { color: colors.textSecondary }]}>
              Round Off: ₹ {formatNumber(detail.bill.round_off || 0, 2)}
            </Text>

            <Text style={[styles.netAmount, { color: colors.primary }]}>
              Net Amount: ₹ {formatNumber(detail.bill.net_amount || 0, 2)}
            </Text>
          </View>
        </View>

        <SectionTitle title="Items" />

        {detail.items?.length ? (
          detail.items.map((item, index) => (
            <BillItemRow
              key={item.bill_item_id || `${item.product_id}-${index}`}
              item={item}
              index={index}
            />
          ))
        ) : (
          <View
            style={[
              styles.emptyItemsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>
              No bill items found.
            </Text>
          </View>
        )}

        <AppButton
          title={loading ? "Updating..." : "Update Payment Status"}
          onPress={() => setPaymentModalVisible(true)}
          style={{ marginBottom: 10 }}
          disabled={loading || markPaidLoading}
        />

        <AppButton
          title={
            markPaidLoading ? "Posting Receipt..." : "Mark Paid + Receipt Voucher"
          }
          onPress={onMarkPaid}
          style={{ marginBottom: 10 }}
          disabled={loading || markPaidLoading || isPaid}
        />

        <AppButton
          title={loading ? "Processing..." : "Delete Bill"}
          variant="outline"
          onPress={onDelete}
          disabled={loading || markPaidLoading || isPaid}
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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyItemsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
});

export default BillDetailScreen;