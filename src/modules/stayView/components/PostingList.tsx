import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { RoomPosting, postingApi } from "../../../api/postingApi";
import { useThemeStore } from "../../../store/themeStore";
import AppButton from "../../../shared/components/AppButton";
import PostingEditModal from "./PostingEditModal";

type Props = {
  data: RoomPosting[];
  loading: boolean;
  canEdit: boolean;
  onChanged: () => void;
};

const PostingList: React.FC<Props> = ({ data, loading, canEdit, onChanged }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [editVisible, setEditVisible] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState<RoomPosting | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const openEdit = (posting: RoomPosting) => {
    setSelectedPosting(posting);
    setEditVisible(true);
  };

  const handleSave = async (amount: number, taxAmount: number) => {
    if (!selectedPosting) return;

    try {
      setActionLoadingId(selectedPosting.posting_id);
      await postingApi.updatePosting(selectedPosting.posting_id, {
        amount,
        tax_amount: taxAmount,
      });
      setEditVisible(false);
      setSelectedPosting(null);
      onChanged();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not update posting."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const onDelete = (posting: RoomPosting) => {
    Alert.alert(
      "Delete Posting",
      "Are you sure you want to delete this posting?",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(posting.posting_id);
              await postingApi.deletePosting(posting.posting_id);
              onChanged();
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message ||
                  e?.message ||
                  "Could not delete posting."
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading && data.length === 0) {
    return (
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        Loading postings...
      </Text>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        No postings yet.
      </Text>
    );
  }

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.posting_id)}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const amount = Number(item.amount || 0);
          const taxAmount = Number(item.tax_amount || 0);
          const disabled = actionLoadingId === item.posting_id || !canEdit;

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.topRow}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {item.charge_type}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  #{item.posting_id}
                </Text>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Amount: ₹ {amount.toFixed(2)}
              </Text>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Tax: ₹ {taxAmount.toFixed(2)}
              </Text>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Date: {item.posting_date}
              </Text>

              <View style={styles.buttonRow}>
                <AppButton
                  title="Edit"
                  size="small"
                  variant="outline"
                  onPress={() => openEdit(item)}
                  disabled={disabled}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <AppButton
                  title="Delete"
                  size="small"
                  onPress={() => onDelete(item)}
                  disabled={disabled}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          );
        }}
      />

      <PostingEditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSave={handleSave}
        initialAmount={Number(selectedPosting?.amount || 0)}
        initialTaxAmount={Number(selectedPosting?.tax_amount || 0)}
        editable={canEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
});

export default PostingList;