import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Kot } from "../../api/types";
import { fetchKotList } from "../kot/api";
import { createBillFromKot } from "./api";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import AppInput from "../../shared/components/AppInput";
import SectionTitle from "../../shared/components/SectionTitle";
import SelectModal, { SelectItem } from "../../shared/components/SelectModal";
import { formatDateTime } from "../../shared/utils/date";
import { useThemeStore } from "../../store/themeStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

const BILL_TYPE_OPTIONS: SelectItem[] = [
  { label: "Restaurant", value: "Restaurant" },
  { label: "Room", value: "Room" },
];

type RouteProps = RouteProp<RootStackParamList, "BillFromKot">;

const BillFromKotScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { theme } = useThemeStore();

  const [loading, setLoading] = useState(false);
  const [kots, setKots] = useState<Kot[]>([]);
  const [selectedKotIds, setSelectedKotIds] = useState<number[]>(
    route.params?.kotIds || []
  );
  const [billType, setBillType] = useState("Restaurant");
  const [billTypeModalVisible, setBillTypeModalVisible] = useState(false);

  useEffect(() => {
    loadOpenKots();
  }, []);

  const loadOpenKots = async () => {
    try {
      setLoading(true);
      const res = await fetchKotList("Open");
      setKots(res);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load KOTs");
    } finally {
      setLoading(false);
    }
  };

  const toggleKot = (kotId?: number) => {
    if (!kotId) return;
    setSelectedKotIds((prev) =>
      prev.includes(kotId) ? prev.filter((id) => id !== kotId) : [...prev, kotId]
    );
  };

  const selectedKots = useMemo(
    () => kots.filter((k) => k.kot_id && selectedKotIds.includes(k.kot_id)),
    [kots, selectedKotIds]
  );

  const handleGenerateBill = async () => {
    if (selectedKotIds.length === 0) {
      Alert.alert("Validation", "Please select at least one KOT");
      return;
    }

    try {
      setLoading(true);
      const res = await createBillFromKot({
        kot_ids: selectedKotIds,
        bill_type: billType,
      });

      Alert.alert("Success", `Bill generated: ${res.bill.bill_no}`, [
        {
          text: "Open Bill",
          onPress: () =>
            navigation.replace("BillDetail", { billId: res.bill.bill_id }),
        },
        {
          text: "Back",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  if (loading && kots.length === 0) {
    return <Loader />;
  }

  const colors = theme.colors;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionTitle
          title="Generate Bill from KOT"
          subtitle={`${selectedKotIds.length} selected`}
        />

        <AppInput
          label="Bill Type"
          value={billType}
          editable={false}
          onPress={() => setBillTypeModalVisible(true)}
        />

        {kots.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No open KOT available
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create KOT first or check current KOT status
            </Text>
          </View>
        ) : (
          kots.map((kot) => {
            const selected = !!kot.kot_id && selectedKotIds.includes(kot.kot_id);
            const guestName =
              kot.first_name || kot.last_name
                ? `${kot.first_name || ""} ${kot.last_name || ""}`.trim()
                : "";

            return (
              <TouchableOpacity
                key={kot.kot_id}
                activeOpacity={0.85}
                onPress={() => toggleKot(kot.kot_id)}
                style={[
                  styles.kotCard,
                  {
                    backgroundColor: selected
                      ? `${colors.primary}12`
                      : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.kotTopRow}>
                  <Text style={[styles.kotNo, { color: colors.text }]}>
                    {kot.kot_no || `KOT #${kot.kot_id}`}
                  </Text>
                  <Text style={[styles.selectText, { color: colors.primary }]}>
                    {selected ? "Selected" : "Tap to select"}
                  </Text>
                </View>

                <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                  {kot.kot_datetime ? formatDateTime(kot.kot_datetime) : ""}
                </Text>

                <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                  Service: {kot.service_type}
                </Text>

                {kot.room_no ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Room: {kot.room_no}
                  </Text>
                ) : null}

                {kot.table_no ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Table: {kot.table_no}
                  </Text>
                ) : null}

                {guestName ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Guest: {guestName}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}

        <AppButton
          title="Generate Bill"
          onPress={handleGenerateBill}
          loading={loading}
        />
      </ScrollView>

      <SelectModal
        visible={billTypeModalVisible}
        title="Select Bill Type"
        data={BILL_TYPE_OPTIONS}
        onSelect={(item) => {
          setBillType(String(item.value));
          setBillTypeModalVisible(false);
        }}
        onClose={() => setBillTypeModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, padding: 16 },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
  kotCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  kotTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  kotNo: {
    fontSize: 15,
    fontWeight: "700",
  },
  selectText: {
    fontSize: 12,
    fontWeight: "700",
  },
  kotMeta: {
    fontSize: 13,
    marginBottom: 4,
  },
});

export default BillFromKotScreen;