import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  visible: boolean;
  maxAmount: number;
  defaultPaymentType?: string | null;
  defaultRefNo?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    refunded_amount: number;
    refund_payment_type: string;
    refund_ref_no?: string;
    refund_reason?: string;
  }) => Promise<void> | void;
};

const PAYMENT_OPTIONS = ["Cash", "Card", "UPI", "Other"];

const RefundAdvanceModal: React.FC<Props> = ({
  visible,
  maxAmount,
  defaultPaymentType,
  defaultRefNo,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState(defaultPaymentType || "");
  const [refNo, setRefNo] = useState(defaultRefNo || "");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    setAmount(maxAmount > 0 ? String(maxAmount) : "");
    setPaymentType(defaultPaymentType || "");
    setRefNo(defaultRefNo || "");
    setReason("");
    setErrors({});
  }, [visible, maxAmount, defaultPaymentType, defaultRefNo]);

  const parsedAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const amt = Number(amount);

    if (!Number.isFinite(amt) || amt <= 0) {
      nextErrors.amount = "Refund amount must be greater than zero";
    } else if (amt > Number(maxAmount || 0)) {
      nextErrors.amount = `Refund amount cannot exceed ${maxAmount}`;
    }

    if (!String(paymentType || "").trim()) {
      nextErrors.paymentType = "Refund payment type is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      refunded_amount: parsedAmount,
      refund_payment_type: paymentType.trim(),
      refund_ref_no: refNo.trim() || undefined,
      refund_reason: reason.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={loading ? undefined : onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: "85%",
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Title only, no separate header strip with button */}
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Refund / Cancel Advance
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              Available refundable amount: {maxAmount}
            </Text>

            <AppInput
              label="Refund amount"
              value={amount}
              keyboardType="numeric"
              placeholder="Enter refund amount"
              onChangeText={(val) => {
                setAmount(val);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }
              }}
            />
            {errors.amount ? (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {errors.amount}
              </Text>
            ) : null}

            {/* Dropdown for refund payment type */}
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Refund payment type
              </Text>
              <View
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {PAYMENT_OPTIONS.map((opt, idx) => {
                  const selected = paymentType === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setPaymentType(opt);
                        if (errors.paymentType) {
                          setErrors((prev) => ({ ...prev, paymentType: "" }));
                        }
                      }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        backgroundColor: selected
                          ? colors.primary + "11"
                          : colors.background,
                        borderBottomWidth:
                          idx === PAYMENT_OPTIONS.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: selected ? colors.primary : colors.text,
                          fontSize: 13,
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {errors.paymentType ? (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {errors.paymentType}
              </Text>
            ) : null}

            <AppInput
              label="Refund reference no."
              value={refNo}
              placeholder="Txn / voucher / bank ref no."
              onChangeText={setRefNo}
            />

            <AppInput
              label="Refund reason"
              value={reason}
              placeholder="Reason for refund / cancellation"
              onChangeText={setReason}
              multiline
            />

            <View style={{ marginTop: 14 }}>
              <AppButton
                title={loading ? "Processing..." : "Submit"}
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RefundAdvanceModal;