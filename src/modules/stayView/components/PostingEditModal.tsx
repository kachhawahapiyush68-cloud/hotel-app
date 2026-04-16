import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useThemeStore } from "../../../store/themeStore";
import AppButton from "../../../shared/components/AppButton";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, taxAmount: number) => void;
  initialAmount: number;
  initialTaxAmount: number;
  editable: boolean;
  loading?: boolean;
};

const PostingEditModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialAmount,
  initialTaxAmount,
  editable,
  loading = false,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [amount, setAmount] = useState(String(initialAmount || ""));
  const [taxAmount, setTaxAmount] = useState(String(initialTaxAmount || 0));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setAmount(
        initialAmount !== undefined && initialAmount !== null
          ? String(initialAmount)
          : ""
      );
      setTaxAmount(
        initialTaxAmount !== undefined && initialTaxAmount !== null
          ? String(initialTaxAmount)
          : "0"
      );
      setErrors({});
    }
  }, [visible, initialAmount, initialTaxAmount]);

  const parsedAmount = useMemo(() => Number(amount || 0), [amount]);
  const parsedTaxAmount = useMemo(() => Number(taxAmount || 0), [taxAmount]);
  const total = useMemo(() => {
    const a = Number.isFinite(parsedAmount) ? parsedAmount : 0;
    const t = Number.isFinite(parsedTaxAmount) ? parsedTaxAmount : 0;
    return a + Math.max(t, 0);
  }, [parsedAmount, parsedTaxAmount]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!String(amount).trim()) {
      nextErrors.amount = "Amount is required";
    } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Amount must be greater than zero";
    }

    if (String(taxAmount).trim()) {
      if (!Number.isFinite(parsedTaxAmount) || parsedTaxAmount < 0) {
        nextErrors.taxAmount = "Tax amount cannot be negative";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!editable) {
      Alert.alert("Not allowed", "This posting cannot be edited.");
      return;
    }

    if (loading) return;

    if (!validate()) return;

    onSave(Number(amount), Number(taxAmount || 0));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Edit Posting
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Update amount and tax.
          </Text>

          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <TextInput
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }
              }}
              editable={editable && !loading}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: errors.amount ? colors.error : colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            {!!errors.amount && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.amount}
              </Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Tax Amount
            </Text>
            <TextInput
              value={taxAmount}
              onChangeText={(val) => {
                setTaxAmount(val);
                if (errors.taxAmount) {
                  setErrors((prev) => ({ ...prev, taxAmount: "" }));
                }
              }}
              editable={editable && !loading}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: errors.taxAmount ? colors.error : colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            />
            {!!errors.taxAmount && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.taxAmount}
              </Text>
            )}
          </View>

          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Total
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "700",
                marginTop: 2,
              }}
            >
              ₹ {total.toFixed(2)}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={loading}
              onPress={onClose}
              style={[
                styles.secondaryBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <View style={{ width: 10 }} />

            <View style={{ flex: 1 }}>
              <AppButton
                title={loading ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={!editable || loading}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  secondaryBtn: {
    minWidth: 96,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});

export default PostingEditModal;