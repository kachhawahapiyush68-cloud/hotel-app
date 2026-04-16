import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import { CreateKotItemInput } from "../../../api/types";
import { formatNumber } from "../../../shared/utils/number";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  index: number;
  value: CreateKotItemInput;
  onChange: (next: CreateKotItemInput) => void;
  onRemove: () => void;
  onSelectProduct: () => void;
  productName?: string;
  disabled?: boolean;
};

const sanitizeDecimalInput = (text: string) => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");

  if (firstDotIndex === -1) return cleaned;

  const beforeDot = cleaned.slice(0, firstDotIndex + 1);
  const afterDot = cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
  return `${beforeDot}${afterDot}`;
};

const toNumberOrZero = (text: string) => {
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
};

const KotItemRow: React.FC<Props> = ({
  index,
  value,
  onChange,
  onRemove,
  onSelectProduct,
  productName,
  disabled = false,
}) => {
  const { theme } = useThemeStore();

  const [qtyError, setQtyError] = useState("");
  const [rateError, setRateError] = useState("");

  const [qtyText, setQtyText] = useState(
    value.qty !== undefined && value.qty !== null ? String(value.qty) : ""
  );
  const [rateText, setRateText] = useState(
    value.rate_at_time !== undefined && value.rate_at_time !== null
      ? String(value.rate_at_time)
      : ""
  );

  useEffect(() => {
    setQtyText(
      value.qty !== undefined && value.qty !== null ? String(value.qty) : ""
    );
  }, [value.qty]);

  useEffect(() => {
    setRateText(
      value.rate_at_time !== undefined && value.rate_at_time !== null
        ? String(value.rate_at_time)
        : ""
    );
  }, [value.rate_at_time]);

  const amount = useMemo(() => {
    const qty = Number(value.qty) || 0;
    const rate =
      value.rate_at_time != null ? Number(value.rate_at_time) || 0 : 0;
    return qty * rate;
  }, [value.qty, value.rate_at_time]);

  useEffect(() => {
    const q = Number(value.qty || 0);
    const r = Number(value.rate_at_time ?? 0);

    setQtyError(q <= 0 ? "Qty must be greater than 0" : "");
    setRateError(r < 0 ? "Rate cannot be negative" : "");
  }, [value.qty, value.rate_at_time]);

  const handleQtyChange = (text: string) => {
    const cleaned = sanitizeDecimalInput(text);
    setQtyText(cleaned);

    onChange({
      ...value,
      qty: cleaned === "" ? 0 : toNumberOrZero(cleaned),
    });
  };

  const handleRateChange = (text: string) => {
    const cleaned = sanitizeDecimalInput(text);
    setRateText(cleaned);

    onChange({
      ...value,
      rate_at_time: cleaned === "" ? 0 : toNumberOrZero(cleaned),
    });
  };

  const handleRemarksChange = (text: string) => {
    onChange({
      ...value,
      remarks: text,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.text,
          opacity: disabled ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.indexText, { color: theme.colors.text }]}>
            Item #{index + 1}
          </Text>
          <Text
            style={[styles.helperText, { color: theme.colors.textSecondary }]}
          >
            Select product and enter quantity
          </Text>
        </View>

        {!disabled && (
          <AppButton
            title="Remove"
            variant="outline"
            size="small"
            onPress={onRemove}
          />
        )}
      </View>

      <AppInput
        label="Product"
        value={productName || ""}
        placeholder="Select product"
        editable={false}
        onPress={disabled ? undefined : onSelectProduct}
      />

      <View style={styles.inlineRow}>
        <View style={styles.inlineCol}>
          <AppInput
            label="Qty"
            keyboardType="decimal-pad"
            value={qtyText}
            editable={!disabled}
            onChangeText={handleQtyChange}
            placeholder="0"
          />
          {qtyError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {qtyError}
            </Text>
          ) : null}
        </View>

        <View style={styles.inlineCol}>
          <AppInput
            label="Rate"
            keyboardType="decimal-pad"
            value={rateText}
            editable={!disabled}
            onChangeText={handleRateChange}
            placeholder="0"
          />
          {rateError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {rateError}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.amountCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[styles.amountLabel, { color: theme.colors.textSecondary }]}
        >
          Amount
        </Text>
        <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
          ₹ {formatNumber(amount, 2)}
        </Text>
      </View>

      <AppInput
        label="Notes"
        value={value.remarks || ""}
        editable={!disabled}
        onChangeText={handleRemarksChange}
        multiline
        placeholder="Optional note"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  indexText: {
    fontSize: 15,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
  },
  inlineCol: {
    flex: 1,
  },
  amountCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default KotItemRow;