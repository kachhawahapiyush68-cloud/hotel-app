import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TextInput } from "react-native";
import { useThemeStore } from "../../../store/themeStore";
import AppButton from "../../../shared/components/AppButton";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, taxAmount: number) => void;
  initialAmount: number;
  initialTaxAmount: number;
  editable: boolean;
};

const PostingEditModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialAmount,
  initialTaxAmount,
  editable,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [amount, setAmount] = useState(String(initialAmount || ""));
  const [taxAmount, setTaxAmount] = useState(String(initialTaxAmount || "0"));

  useEffect(() => {
    if (visible) {
      setAmount(String(initialAmount || ""));
      setTaxAmount(String(initialTaxAmount || "0"));
    }
  }, [visible, initialAmount, initialTaxAmount]);

  const handleSave = () => {
    const amt = Number(amount) || 0;
    const tax = Number(taxAmount || 0) || 0;

    if (!amt || amt <= 0) return;
    onSave(amt, tax < 0 ? 0 : tax);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Edit Posting
          </Text>

          {!editable ? (
            <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>
              Posting can be edited only before checkout.
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Amount
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            editable={editable}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Tax Amount
          </Text>
          <TextInput
            value={taxAmount}
            onChangeText={setTaxAmount}
            keyboardType="numeric"
            editable={editable}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <View style={styles.buttonRow}>
            <AppButton
              title="Close"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Save"
              onPress={handleSave}
              disabled={!editable}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000055",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
  },
});

export default PostingEditModal;