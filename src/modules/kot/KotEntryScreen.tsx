// modules/kot/KotEntryScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Alert, View, Text } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  KotDetailResponse,
  CreateKotItemInput,
  CreateKotPayload,
  KotServiceType,
  InHouseRoomOption,
  KotStatus,
} from "../../api/types";
import {
  createKot,
  fetchKotDetail,
  fetchInHouseRooms,
  updateKot,
  updateKotStatus,
  deleteKot,
} from "./api";
import Loader from "../../shared/components/Loader";
import AppInput from "../../shared/components/AppInput";
import AppButton from "../../shared/components/AppButton";
import SectionTitle from "../../shared/components/SectionTitle";
import SelectModal, { SelectItem } from "../../shared/components/SelectModal";
import KotItemRow from "./components/KotItemRow";
import { formatDateTime } from "../../shared/utils/date";
import { productApi, Product } from "../../api/productApi";
import { useThemeStore } from "../../store/themeStore";

type ParamList = {
  KotEntry: {
    kotId?: number;
    booking_id?: number;
    room_id?: number;
    table_no?: string;
    service_type?: KotServiceType;
  };
};

const SERVICE_TYPE_OPTIONS: SelectItem[] = [
  { label: "Table Service", value: "TABLE" },
  { label: "Room Service", value: "ROOM" },
];

const KotEntryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "KotEntry">>();
  const { theme } = useThemeStore();

  const kotId = route.params?.kotId;
  const isView = !!kotId;

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<KotDetailResponse | null>(null);

  const [kotNo, setKotNo] = useState("");
  const [notes, setNotes] = useState("");
  const [tableNo, setTableNo] = useState(route.params?.table_no || "");
  const [bookingId, setBookingId] = useState<number | undefined>(route.params?.booking_id);
  const [roomId, setRoomId] = useState<number | undefined>(route.params?.room_id);
  const [serviceType, setServiceType] = useState<KotServiceType>(
    route.params?.service_type || "TABLE"
  );
  const [items, setItems] = useState<CreateKotItemInput[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [rooms, setRooms] = useState<InHouseRoomOption[]>([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const [serviceTypePickerVisible, setServiceTypePickerVisible] = useState(false);
  const [roomPickerVisible, setRoomPickerVisible] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (kotId) {
      loadKot(kotId);
    }
  }, [kotId]);

  useEffect(() => {
    if (!isView && serviceType === "ROOM") {
      loadRooms();
    }
  }, [serviceType, isView]);

  const loadProducts = async () => {
    try {
      const res = await productApi.list();
      setProducts(res);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load products");
    }
  };

  const loadRooms = async () => {
    try {
      const res = await fetchInHouseRooms();
      setRooms(res);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load rooms");
    }
  };

  const loadKot = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetchKotDetail(id);
      setDetail(res);
      setKotNo(res.kot.kot_no || "");
      setNotes(res.kot.notes || "");
      setTableNo(res.kot.table_no || "");
      setBookingId(res.kot.booking_id ?? undefined);
      setRoomId(res.kot.room_id ?? undefined);
      setServiceType(res.kot.service_type || "TABLE");

      setItems(
        res.items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          rate_at_time: item.rate_at_time,
          remarks: item.remarks || null,
          status: item.status || "Normal",
        }))
      );
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load KOT");
    } finally {
      setLoading(false);
    }
  };

  const productOptions: SelectItem[] = useMemo(
    () =>
      products.map((product) => ({
        label: `${product.product_name} • ₹${product.rate}`,
        value: product.product_id,
      })),
    [products]
  );

  const roomOptions: SelectItem[] = useMemo(
    () =>
      rooms.map((room) => ({
        label: room.display_label,
        value: room.booking_id,
      })),
    [rooms]
  );

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.product_id === productId);
    return product?.product_name || "";
  };

  const getSelectedRoomLabel = () => {
    const room = rooms.find((r) => r.booking_id === bookingId);
    return room?.display_label || "";
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: 0,
        qty: 1,
        rate_at_time: 0,
        remarks: null,
        status: "Normal",
      },
    ]);
  };

  const updateItem = (index: number, next: CreateKotItemInput) => {
    setItems((prev) => prev.map((item, i) => (i === index ? next : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openProductPicker = (index: number) => {
    setSelectedRowIndex(index);
    setPickerVisible(true);
  };

  const onSelectProduct = (item: SelectItem) => {
    if (selectedRowIndex == null) return;

    const product = products.find((p) => p.product_id === Number(item.value));
    if (!product) return;

    setItems((prev) =>
      prev.map((row, i) =>
        i === selectedRowIndex
          ? {
              ...row,
              product_id: product.product_id,
              rate_at_time:
                row.rate_at_time != null && row.rate_at_time > 0
                  ? row.rate_at_time
                  : (product.rate as number) ?? 0,
            }
          : row
      )
    );

    setPickerVisible(false);
    setSelectedRowIndex(null);
  };

  const onSelectServiceType = (item: SelectItem) => {
    const next = item.value as KotServiceType;
    setServiceType(next);

    if (next === "TABLE") {
      setBookingId(undefined);
      setRoomId(undefined);
    } else {
      setTableNo("");
    }

    setServiceTypePickerVisible(false);
  };

  const onSelectRoom = (item: SelectItem) => {
    const selected = rooms.find((r) => r.booking_id === Number(item.value));
    if (!selected) return;

    setBookingId(selected.booking_id);
    setRoomId(selected.room_id ?? undefined);
    setRoomPickerVisible(false);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate_at_time ?? 0) || 0),
    0
  );

  const validate = () => {
    if (items.length === 0) {
      Alert.alert("Validation", "Please add at least one item");
      return false;
    }

    const hasInvalid = items.some(
      (item) => !item.product_id || Number(item.qty) <= 0 || Number(item.rate_at_time ?? 0) < 0
    );

    if (hasInvalid) {
      Alert.alert("Validation", "Each item must have product, qty greater than 0, and valid rate");
      return false;
    }

    if (serviceType === "TABLE" && !tableNo.trim()) {
      Alert.alert("Validation", "Table no is required for table KOT");
      return false;
    }

    if (serviceType === "ROOM" && !bookingId) {
      Alert.alert("Validation", "Please select a checked-in room");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    const payload: CreateKotPayload = {
      service_type: serviceType,
      table_no: serviceType === "TABLE" ? tableNo.trim() : undefined,
      booking_id: serviceType === "ROOM" ? bookingId : undefined,
      room_id: serviceType === "ROOM" ? roomId : undefined,
      notes: notes.trim() || undefined,
      items,
    };

    try {
      setLoading(true);
      const res = await createKot(payload);
      Alert.alert("Success", `KOT created successfully: ${res.kot.kot_no}`, [
        {
          text: "Open",
          onPress: () => navigation.replace("KotEntry", { kotId: res.kot.kot_id }),
        },
        {
          text: "Back to List",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to create KOT");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !kotId) return;

    try {
      setLoading(true);
      await updateKot(kotId, {
        service_type: serviceType,
        table_no: serviceType === "TABLE" ? tableNo.trim() : undefined,
        booking_id: serviceType === "ROOM" ? bookingId : undefined,
        room_id: serviceType === "ROOM" ? roomId : undefined,
        notes: notes.trim() || undefined,
        items,
      });
      Alert.alert("Success", "KOT updated successfully");
      await loadKot(kotId);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to update KOT");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelKot = async () => {
    if (!kotId) return;
    Alert.alert("Cancel KOT", "Are you sure you want to cancel this KOT?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await updateKotStatus(kotId, "Cancelled");
            Alert.alert("Success", "KOT cancelled");
            await loadKot(kotId);
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || e?.message || "Failed to cancel KOT"
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteKot = async () => {
    if (!kotId) return;
    Alert.alert("Delete KOT", "Delete this KOT permanently? (Not billed only)", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteKot(kotId);
            Alert.alert("Deleted", "KOT deleted");
            navigation.goBack();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || e?.message || "Failed to delete KOT"
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading && isView && !detail) {
    return <Loader />;
  }

  const guestName =
    detail?.kot?.first_name || detail?.kot?.last_name
      ? `${detail?.kot?.first_name || ""} ${detail?.kot?.last_name || ""}`.trim()
      : "";

  const canEditOrCancel: boolean =
    !!detail && detail.kot.status === "Open";

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          title={isView ? "KOT Detail" : "New KOT"}
          subtitle={isView ? kotNo || `KOT #${kotId}` : "Create kitchen order"}
        />

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Status
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {detail?.kot?.status || "Open"}
              </Text>
            </View>

            <View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ₹ {totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {kotNo ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              KOT No: {kotNo}
            </Text>
          ) : null}

          {isView && detail?.kot?.kot_datetime ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Date: {formatDateTime(detail.kot.kot_datetime)}
            </Text>
          ) : null}

          {guestName ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Guest: {guestName}
            </Text>
          ) : null}

          {detail?.kot?.room_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Room: {detail.kot.room_no}
            </Text>
          ) : null}

          {detail?.kot?.folio_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Folio: {detail.kot.folio_no}
            </Text>
          ) : null}
        </View>

        <SectionTitle title="Order Info" />

        <AppInput
          label="Service Type"
          value={serviceType}
          editable={false}
          onPress={isView ? undefined : () => setServiceTypePickerVisible(true)}
          placeholder="Select service type"
        />

        {serviceType === "TABLE" ? (
          <AppInput
            label="Table No"
            value={tableNo}
            onChangeText={setTableNo}
            placeholder="Enter table number"
            editable={!isView || canEditOrCancel}
          />
        ) : (
          <AppInput
            label="Checked-in Room"
            value={
              isView
                ? detail?.kot?.display_label || detail?.kot?.room_no || ""
                : getSelectedRoomLabel()
            }
            editable={false}
            onPress={isView ? undefined : () => setRoomPickerVisible(true)}
            placeholder="Select checked-in room"
          />
        )}

        <AppInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          editable={!isView || canEditOrCancel}
          multiline
          placeholder="Kitchen note / room service note"
        />

        <SectionTitle title="Items" />

        {items.length === 0 && !isView ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No items added yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add one or more products to create this KOT
            </Text>
          </View>
        ) : null}

        {items.map((item, index) => (
          <KotItemRow
            key={index}
            index={index}
            value={item}
            productName={getProductName(item.product_id)}
            onChange={(next) => updateItem(index, next)}
            onRemove={() => removeItem(index)}
            onSelectProduct={() => openProductPicker(index)}
            disabled={isView && !canEditOrCancel}
          />
        ))}

        {!isView ? (
          <>
            <AppButton
              title="Add Item"
              variant="outline"
              onPress={addItem}
              style={{ marginBottom: 12 }}
            />
            <AppButton title="Save KOT" onPress={handleCreate} loading={loading} />
          </>
        ) : (
          canEditOrCancel && (
            <>
              <AppButton
                title="Update KOT"
                onPress={handleUpdate}
                loading={loading}
                style={{ marginBottom: 8 }}
              />
              <AppButton
                title="Cancel KOT"
                variant="outline"
                onPress={handleCancelKot}
                style={{ marginBottom: 8 }}
              />
              <AppButton
                title="Delete KOT"
                variant="outline"
                onPress={handleDeleteKot}
              />
            </>
          )
        )}
      </ScrollView>

      <SelectModal
        visible={pickerVisible}
        title="Select Product"
        data={productOptions}
        onSelect={onSelectProduct}
        onClose={() => {
          setPickerVisible(false);
          setSelectedRowIndex(null);
        }}
      />

      <SelectModal
        visible={serviceTypePickerVisible}
        title="Select Service Type"
        data={SERVICE_TYPE_OPTIONS}
        onSelect={onSelectServiceType}
        onClose={() => setServiceTypePickerVisible(false)}
      />

      <SelectModal
        visible={roomPickerVisible}
        title="Select Checked-in Room"
        data={roomOptions}
        onSelect={onSelectRoom}
        onClose={() => setRoomPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, padding: 16 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});

export default KotEntryScreen;