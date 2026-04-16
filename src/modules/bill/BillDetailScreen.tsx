// ============================================================
// src/modules/bill/BillDetailScreen.tsx
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  BillDetailResponse,
  BillSummary,
  MarkPaidPayload,
  MarkRefundPayload,
  normalizePaymentStatus,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  PAYMENT_MODE_OPTIONS,
} from "./types";
import {
  deleteBill,
  fetchBillDetail,
  markBillPaid,
  markBillRefund,
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
  BillDetail: { billId: number };
};

const PAYMENT_OPTIONS: SelectItem[] = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Partially Paid", value: "Partial" },
  { label: "Paid", value: "Paid" },
  { label: "Refund", value: "Refund" },
];

const PAY_MODE_ITEMS: SelectItem[] = PAYMENT_MODE_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

const getApiErrorMessage = (e: any, fallback: string) => {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    fallback
  );
};

const BillDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, "BillDetail">>();
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const billId = route.params.billId;

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detail, setDetail] = useState<BillDetailResponse | null>(null);
  const [loadError, setLoadError] = useState<string>("");

  const [paymentModal, setPaymentModal] = useState(false);
  const [payModeModal, setPayModeModal] = useState(false);
  const [refundModeModal, setRefundModeModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await fetchBillDetail(billId);
      setDetail(res);
    } catch (e: any) {
      const msg = getApiErrorMessage(e, "Failed to load bill");
      setLoadError(msg);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    load();
  }, [load]);

  const bill = detail?.bill;
  const summary: BillSummary | null = detail?.summary ?? null;
  const items = detail?.items ?? [];

  const guestName = useMemo(() => {
    if (!bill) return "";
    return [bill.first_name, bill.last_name].filter(Boolean).join(" ").trim();
  }, [bill]);

  const payStatus = normalizePaymentStatus(bill?.payment_status);
  const statusLabel = getPaymentStatusLabel(payStatus);
  const statusColor = getPaymentStatusColor(payStatus);
  const isPaid = payStatus === "Paid";
  const isRefund = payStatus === "Refund";

  const chargeItems = items.filter(
    (i) => (i.display_category ?? "CHARGE") === "CHARGE"
  );
  const discountItems = items.filter((i) => i.display_category === "DISCOUNT");
  const paymentItems = items.filter((i) => i.display_category === "PAYMENT");

  const onSelectPaymentStatus = async (item: SelectItem) => {
    if (loading || actionLoading) return;

    try {
      setPaymentModal(false);
      setActionLoading(true);
      await updateBillPaymentStatus(billId, String(item.value));
      await load();
      Alert.alert("Success", "Payment status updated");
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to update"));
    } finally {
      setActionLoading(false);
    }
  };

  const onMarkPaidPress = () => {
    if (!bill || !summary || actionLoading) return;

    if ((summary.due_amount ?? 0) <= 0) {
      Alert.alert("Not allowed", "No outstanding due amount to collect.");
      return;
    }

    setPayModeModal(true);
  };

  const onSelectPayMode = async (item: SelectItem) => {
    setPayModeModal(false);
    if (!summary) return;

    const paymentMode = item.value as "CASH" | "BANK" | "UPI" | "CARD";
    const dueAmount = summary.due_amount;

    Alert.alert(
      "Mark Paid",
      `Collect ₹ ${formatNumber(dueAmount, 2)} via ${item.label}?`,
      [
        { text: "Cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setActionLoading(true);

              const payload: MarkPaidPayload = {
                amount: dueAmount,
                payment_mode: paymentMode,
              };

              const res = await markBillPaid(billId, payload);
              await load();

              const voucherText = res.voucher
                ? `\nVoucher: ${res.voucher.voucher_no} (${res.voucher.voucher_type})`
                : "";

              Alert.alert("Success", `Payment recorded.${voucherText}`);
            } catch (e: any) {
              Alert.alert("Error", getApiErrorMessage(e, "Failed"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const onMarkRefundPress = () => {
    if (!bill || !summary || actionLoading) return;

    if ((summary.refund_amount ?? 0) <= 0) {
      Alert.alert(
        "Not allowed",
        "No refund amount computed. Guest has not overpaid."
      );
      return;
    }

    setRefundModeModal(true);
  };

  const onSelectRefundMode = async (item: SelectItem) => {
    setRefundModeModal(false);
    if (!summary) return;

    const refundMode = item.value as "CASH" | "BANK" | "UPI" | "CARD";
    const refundAmount = summary.refund_amount;

    Alert.alert(
      "Process Refund",
      `Return ₹ ${formatNumber(refundAmount, 2)} via ${item.label}?\nThis action cannot be undone.`,
      [
        { text: "Cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);

              const payload: MarkRefundPayload = {
                refund_mode: refundMode,
              };

              const res = await markBillRefund(billId, payload);
              await load();

              const voucherText = res.voucher
                ? `\nVoucher: ${res.voucher.voucher_no} (${res.voucher.voucher_type})`
                : "";

              Alert.alert("Success", `Refund processed.${voucherText}`);
            } catch (e: any) {
              Alert.alert("Error", getApiErrorMessage(e, "Failed"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const onDelete = () => {
    if (loading || actionLoading) return;

    Alert.alert("Delete Bill", "Are you sure? This cannot be undone.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);
            await deleteBill(billId);
            Alert.alert("Deleted", "Bill deleted", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (e: any) {
            Alert.alert("Error", getApiErrorMessage(e, "Failed"));
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading && !detail) return <Loader />;

  if (!detail || !bill) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Unable to open bill
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {loadError || "Bill not found."}
        </Text>
        <AppButton
          title="Retry"
          onPress={load}
          style={{ marginTop: 16, minWidth: 140 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Bill Detail" subtitle={bill.bill_no} />

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.statusRow}>
            <View
              style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
            <Text style={[styles.billType, { color: colors.textSecondary }]}>
              {bill.bill_type}
            </Text>
          </View>

          <Text style={[styles.rowText, { color: colors.textSecondary }]}>
            Date: {bill.bill_datetime ? formatDateTime(bill.bill_datetime) : "—"}
          </Text>

          {guestName ? (
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>
              Guest: {guestName}
            </Text>
          ) : null}

          {bill.room_no ? (
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>
              Room: {bill.room_no}
            </Text>
          ) : null}

          {bill.folio_no ? (
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>
              Folio: {bill.folio_no}
            </Text>
          ) : null}

          {bill.reservation_no ? (
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>
              Booking: {bill.reservation_no}
            </Text>
          ) : null}

          {summary ? (
            <View
              style={[styles.amountBox, { borderTopColor: colors.border }]}
            >
              <Row label="Gross Amount" value={summary.gross_amount} colors={colors} />

              {summary.discount_amount > 0 && (
                <Row
                  label="Discount"
                  value={summary.discount_amount}
                  colors={colors}
                  negative
                />
              )}

              {summary.tax_amount > 0 && (
                <Row label="Tax" value={summary.tax_amount} colors={colors} />
              )}

              {summary.round_off !== 0 && (
                <Row label="Round Off" value={summary.round_off} colors={colors} />
              )}

              <View style={[styles.divider, { borderColor: colors.border }]} />

              <Row
                label="Net Amount"
                value={summary.net_amount}
                colors={colors}
                bold
                primary
              />

              <View style={[styles.divider, { borderColor: colors.border }]} />

              <Row
                label="Total Paid"
                value={summary.total_paid}
                colors={colors}
                color="#2563EB"
              />

              {summary.due_amount > 0 && (
                <Row
                  label="Due Amount"
                  value={summary.due_amount}
                  colors={colors}
                  color="#D64545"
                  bold
                />
              )}

              {summary.refund_amount > 0 && (
                <Row
                  label="Refund Amount"
                  value={summary.refund_amount}
                  colors={colors}
                  color="#7C3AED"
                  bold
                />
              )}
            </View>
          ) : (
            <View
              style={[styles.amountBox, { borderTopColor: colors.border }]}
            >
              <Row label="Gross Amount" value={bill.gross_amount ?? 0} colors={colors} />
              <Row
                label="Net Amount"
                value={bill.net_amount ?? 0}
                colors={colors}
                bold
                primary
              />
            </View>
          )}
        </View>

        {chargeItems.length > 0 && (
          <>
            <SectionTitle
              title="Charges"
              subtitle={`${chargeItems.length} item${chargeItems.length === 1 ? "" : "s"}`}
            />
            {chargeItems.map((item, i) => (
              <BillItemRow key={item.bill_item_id ?? `c-${i}`} item={item} index={i} />
            ))}
          </>
        )}

        {discountItems.length > 0 && (
          <>
            <SectionTitle
              title="Discounts"
              subtitle={`${discountItems.length} item${discountItems.length === 1 ? "" : "s"}`}
            />
            {discountItems.map((item, i) => (
              <BillItemRow key={item.bill_item_id ?? `d-${i}`} item={item} index={i} />
            ))}
          </>
        )}

        {paymentItems.length > 0 && (
          <>
            <SectionTitle
              title="Payments Received"
              subtitle={`${paymentItems.length} item${paymentItems.length === 1 ? "" : "s"}`}
            />
            {paymentItems.map((item, i) => (
              <BillItemRow key={item.bill_item_id ?? `p-${i}`} item={item} index={i} />
            ))}
          </>
        )}

        {items.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>
              No bill items found.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {(payStatus === "Unpaid" || payStatus === "Partial") && (
            <AppButton
              title={actionLoading ? "Processing..." : "Mark Paid + Voucher"}
              onPress={onMarkPaidPress}
              style={styles.actionBtn}
              disabled={loading || actionLoading}
            />
          )}

          {isRefund && (
            <AppButton
              title={actionLoading ? "Processing..." : "Process Refund + Voucher"}
              onPress={onMarkRefundPress}
              style={[styles.actionBtn, styles.refundBtn]}
              disabled={loading || actionLoading}
            />
          )}

          <AppButton
            title={actionLoading ? "Updating..." : "Update Payment Status"}
            onPress={() => setPaymentModal(true)}
            variant="outline"
            style={styles.actionBtn}
            disabled={loading || actionLoading}
          />

          <AppButton
            title={actionLoading ? "Processing..." : "Delete Bill"}
            variant="outline"
            onPress={onDelete}
            style={styles.actionBtn}
            disabled={loading || actionLoading || isPaid || isRefund}
          />
        </View>
      </ScrollView>

      <SelectModal
        visible={paymentModal}
        title="Update Payment Status"
        data={PAYMENT_OPTIONS}
        onSelect={onSelectPaymentStatus}
        onClose={() => setPaymentModal(false)}
      />

      <SelectModal
        visible={payModeModal}
        title="Select Payment Mode"
        data={PAY_MODE_ITEMS}
        onSelect={onSelectPayMode}
        onClose={() => setPayModeModal(false)}
      />

      <SelectModal
        visible={refundModeModal}
        title="Select Refund Mode"
        data={PAY_MODE_ITEMS}
        onSelect={onSelectRefundMode}
        onClose={() => setRefundModeModal(false)}
      />
    </View>
  );
};

const Row: React.FC<{
  label: string;
  value: number;
  colors: any;
  negative?: boolean;
  bold?: boolean;
  primary?: boolean;
  color?: string;
}> = ({
  label,
  value,
  colors,
  negative = false,
  bold = false,
  primary = false,
  color,
}) => {
  const textColor = color ?? (primary ? colors.primary : colors.text);

  return (
    <View style={rowStyles.row}>
      <Text
        style={[
          rowStyles.label,
          { color: colors.textSecondary, fontWeight: bold ? "700" : "400" },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          rowStyles.value,
          { color: textColor, fontWeight: bold ? "700" : "500" },
        ]}
      >
        {negative ? "- " : ""}₹ {formatNumber(value, 2)}
      </Text>
    </View>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14 },
});

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  billType: {
    fontSize: 13,
    fontWeight: "600",
  },
  rowText: {
    fontSize: 14,
    marginBottom: 6,
  },
  amountBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    marginTop: 8,
  },
  actionBtn: {
    marginBottom: 10,
  },
  refundBtn: {
    borderColor: "#7C3AED",
  },
});

export default BillDetailScreen;