import React, { useMemo, useState, useEffect } from "react";
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

const KotItemRow: React.FC<Props> = ({
  index,
  value,
  onChange,
  onRemove,
  onSelectProduct,
  productName,
  disabled,
}) => {
  const { theme } = useThemeStore();
  const [qtyError, setQtyError] = useState<string>("");
  const [rateError, setRateError] = useState<string>("");

  const amount = useMemo(
    () => (value.qty || 0) * (value.rate_at_time != null ? value.rate_at_time : 0),
    [value.qty, value.rate_at_time]
  );

  useEffect(() => {
    const q = Number(value.qty || 0);
    const r = Number(value.rate_at_time ?? 0);
    setQtyError(q <= 0 ? "Qty must be > 0" : "");
    setRateError(r < 0 ? "Rate cannot be negative" : "");
  }, [value.qty, value.rate_at_time]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.text,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
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
            keyboardType="numeric"
            value={value.qty ? String(value.qty) : ""}
            editable={!disabled}
            onChangeText={(text) =>
              onChange({
                ...value,
                qty: Number(text) || 0,
              })
            }
          />
          {qtyError ? (
            <Text style={{ color: theme.colors.error, fontSize: 11 }}>
              {qtyError}
            </Text>
          ) : null}
        </View>

        <View style={styles.inlineCol}>
          <AppInput
            label="Rate"
            keyboardType="numeric"
            value={
              value.rate_at_time != null ? String(value.rate_at_time) : ""
            }
            editable={!disabled}
            onChangeText={(text) =>
              onChange({
                ...value,
                rate_at_time: Number(text) || 0,
              })
            }
          />
          {rateError ? (
            <Text style={{ color: theme.colors.error, fontSize: 11 }}>
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
        onChangeText={(text) =>
          onChange({
            ...value,
            remarks: text,
          })
        }
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
    marginTop: 4,
  },
  inlineCol: {
    flex: 1,
    marginRight: 8,
  },
  amountCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});

export default KotItemRow;