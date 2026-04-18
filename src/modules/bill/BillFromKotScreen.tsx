import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { formatNumber } from "../../shared/utils/number";
import { useThemeStore } from "../../store/themeStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

const BILL_TYPE_OPTIONS: SelectItem[] = [
  { label: "Restaurant", value: "Restaurant" },
];

type RouteProps = RouteProp<RootStackParamList, "BillFromKot">;

const getApiErrorMessage = (e: any, fallback: string) => {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    fallback
  );
};

const BillFromKotScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kots, setKots] = useState<Kot[]>([]);
  const [selectedKotIds, setSelectedKotIds] = useState<number[]>(
    Array.isArray(route.params?.kotIds)
      ? route.params.kotIds.map(Number).filter((x) => Number.isInteger(x) && x > 0)
      : []
  );
  const [billType, setBillType] = useState("Restaurant");
  const [billTypeModal, setBillTypeModal] = useState(false);

  const loadOpenKots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchKotList("Open");
      setKots(Array.isArray(res) ? res : []);
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to load KOTs"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpenKots();
  }, [loadOpenKots]);

  useEffect(() => {
    if (Array.isArray(route.params?.kotIds) && route.params.kotIds.length > 0) {
      setSelectedKotIds(
        route.params.kotIds.map(Number).filter((x) => Number.isInteger(x) && x > 0)
      );
    }
  }, [route.params?.kotIds]);

  const selectedKots = useMemo(
    () => kots.filter((kot) => kot.kot_id && selectedKotIds.includes(Number(kot.kot_id))),
    [kots, selectedKotIds]
  );

  const selectedTotal = useMemo(
    () =>
      selectedKots.reduce(
        (sum, kot) => sum + (Number((kot as any).total_amount) || 0),
        0
      ),
    [selectedKots]
  );

  const selectedServiceTypes = useMemo(() => {
    return [
      ...new Set(
        selectedKots
          .map((kot) => String(kot.service_type || "").trim().toUpperCase())
          .filter(Boolean)
      ),
    ];
  }, [selectedKots]);

  const hasMixedServiceTypes = selectedServiceTypes.length > 1;

  const selectedTableNos = useMemo(() => {
    return [
      ...new Set(
        selectedKots
          .map((kot) => String(kot.table_no || "").trim().toUpperCase())
          .filter(Boolean)
      ),
    ];
  }, [selectedKots]);

  const hasDifferentTables = useMemo(() => {
    const tableKots = selectedKots.filter(
      (kot) => String(kot.service_type || "").trim().toUpperCase() === "TABLE"
    );

    const tableNos = [
      ...new Set(
        tableKots
          .map((kot) => String(kot.table_no || "").trim().toUpperCase())
          .filter(Boolean)
      ),
    ];

    return tableNos.length > 1;
  }, [selectedKots]);

  const toggleKot = (kot?: Kot) => {
    const kotId = Number(kot?.kot_id || 0);
    if (!kotId) return;

    const serviceType = String(kot?.service_type || "").trim().toUpperCase();
    const tableNo = String(kot?.table_no || "").trim().toUpperCase();

    if (serviceType !== "TABLE") {
      Alert.alert(
        "Not allowed",
        "Only TABLE KOTs can be selected here. ROOM KOT must be billed from booking."
      );
      return;
    }

    setSelectedKotIds((prev) => {
      const exists = prev.includes(kotId);
      if (exists) return prev.filter((id) => id !== kotId);

      const currentlySelected = kots.filter(
        (x) => x.kot_id && prev.includes(Number(x.kot_id))
      );

      const selectedTableNos = [
        ...new Set(
          currentlySelected
            .map((x) => String(x.table_no || "").trim().toUpperCase())
            .filter(Boolean)
        ),
      ];

      if (selectedTableNos.length > 0 && tableNo && !selectedTableNos.includes(tableNo)) {
        Alert.alert(
          "Not allowed",
          "Selected TABLE KOTs must belong to the same table."
        );
        return prev;
      }

      return [...prev, kotId];
    });
  };

  const handleGenerateBill = async () => {
    if (selectedKotIds.length === 0) {
      Alert.alert("Validation", "Please select at least one KOT");
      return;
    }

    if (hasMixedServiceTypes) {
      Alert.alert(
        "Not allowed",
        "Please select KOTs with the same service type only."
      );
      return;
    }

    const selectedServiceType = String(
      selectedKots[0]?.service_type || ""
    ).trim().toUpperCase();

    if (selectedServiceType !== "TABLE") {
      Alert.alert(
        "Not allowed",
        "Only TABLE KOTs can be billed from this screen. ROOM KOT must be posted to folio and billed from booking."
      );
      return;
    }

    if (hasDifferentTables) {
      Alert.alert(
        "Not allowed",
        "Selected TABLE KOTs must belong to the same table."
      );
      return;
    }

    try {
      setSubmitting(true);

      const res = await createBillFromKot({
        kot_ids: selectedKotIds,
        bill_type: billType,
      });

      const createdBillId = Number(res?.bill?.bill_id || 0);

      Alert.alert(
        "Success",
        `Bill generated: ${res.bill.bill_no}\nNet Amount: ₹ ${formatNumber(
          res.summary?.net_amount ?? res.bill.net_amount ?? 0,
          2
        )}`,
        createdBillId > 0
          ? [
              {
                text: "View Bill",
                onPress: () =>
                  navigation.replace("BillDetail", {
                    billId: createdBillId,
                  }),
              },
              {
                text: "Back",
                onPress: () => navigation.goBack(),
              },
            ]
          : [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert(
        "Error",
        getApiErrorMessage(e, "Failed to generate bill")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && kots.length === 0) return <Loader />;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          title="Generate Bill from KOT"
          subtitle={
            selectedKots.length > 0
              ? `${selectedKots.length} selected`
              : "Select table KOTs below"
          }
        />

        <AppInput
          label="Bill Type"
          value={billType}
          editable={false}
          onPress={() => setBillTypeModal(true)}
        />

        {selectedKots.length > 0 && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Only TABLE KOTs can be billed here.
            </Text>
            {selectedTableNos.length > 0 ? (
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Selected Table: {selectedTableNos.join(", ")}
              </Text>
            ) : null}
          </View>
        )}

        {kots.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No open KOTs available
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create a KOT first or check current KOT status
            </Text>
          </View>
        ) : (
          kots.map((kot) => {
            const kotId = Number(kot.kot_id || 0);
            const selected = kotId > 0 && selectedKotIds.includes(kotId);

            const guestName = [kot.first_name, kot.last_name]
              .filter(Boolean)
              .join(" ")
              .trim();

            const serviceType = String(kot.service_type || "")
              .trim()
              .toUpperCase();

            const isRoomKot = serviceType === "ROOM";
            const isTableKot = serviceType === "TABLE";

            return (
              <TouchableOpacity
                key={String(kot.kot_id)}
                activeOpacity={0.85}
                onPress={() => toggleKot(kot)}
                style={[
                  styles.kotCard,
                  {
                    backgroundColor: selected
                      ? `${colors.primary}12`
                      : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: isTableKot ? 1 : 0.75,
                  },
                ]}
              >
                <View style={styles.kotTopRow}>
                  <Text style={[styles.kotNo, { color: colors.text }]}>
                    {(kot as any).kot_no || `KOT #${kot.kot_id}`}
                  </Text>
                  <Text
                    style={[
                      styles.selectHint,
                      { color: isRoomKot ? "#D98E04" : colors.primary },
                    ]}
                  >
                    {selected
                      ? "✓ Selected"
                      : isRoomKot
                      ? "Room KOT"
                      : "Tap to select"}
                  </Text>
                </View>

                {(kot as any).kot_datetime ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    {formatDateTime((kot as any).kot_datetime)}
                  </Text>
                ) : null}

                <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                  Service: {kot.service_type || "—"}
                </Text>

                {(kot as any).room_no ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Room: {(kot as any).room_no}
                  </Text>
                ) : null}

                {(kot as any).table_no ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Table: {(kot as any).table_no}
                  </Text>
                ) : null}

                {guestName ? (
                  <Text style={[styles.kotMeta, { color: colors.textSecondary }]}>
                    Guest: {guestName}
                  </Text>
                ) : null}

                {(Number((kot as any).total_amount) || 0) > 0 ? (
                  <Text style={[styles.kotAmount, { color: colors.primary }]}>
                    ₹ {formatNumber(Number((kot as any).total_amount), 2)}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}

        {selectedKots.length > 0 && selectedTotal > 0 && (
          <View
            style={[
              styles.totalRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Estimated Total ({selectedKots.length} KOT
              {selectedKots.length > 1 ? "s" : ""})
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ₹ {formatNumber(selectedTotal, 2)}
            </Text>
          </View>
        )}

        <AppButton
          title={submitting ? "Generating..." : "Generate Bill"}
          onPress={handleGenerateBill}
          loading={submitting}
          disabled={loading || submitting || selectedKotIds.length === 0}
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      <SelectModal
        visible={billTypeModal}
        title="Select Bill Type"
        data={BILL_TYPE_OPTIONS}
        onSelect={(item) => {
          setBillType(String(item.value));
          setBillTypeModal(false);
        }}
        onClose={() => setBillTypeModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
  kotCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  kotTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  kotNo: { fontSize: 15, fontWeight: "700" },
  selectHint: { fontSize: 12, fontWeight: "700" },
  kotMeta: { fontSize: 13, marginBottom: 3 },
  kotAmount: { marginTop: 4, fontSize: 15, fontWeight: "700" },
  totalRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 14, fontWeight: "600" },
  totalAmount: { fontSize: 16, fontWeight: "700" },
});

export default BillFromKotScreen;