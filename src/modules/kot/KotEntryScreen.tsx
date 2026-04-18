import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollView, StyleSheet, Alert, View, Text } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  KotDetailResponse,
  CreateKotItemInput,
  CreateKotPayload,
  KotServiceType,
  InHouseRoomOption,
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
import { RootStackParamList } from "../../navigation/RootNavigator";

type ParamList = RootStackParamList;
type RouteProps = RouteProp<ParamList, "KotEntry">;

const SERVICE_TYPE_OPTIONS: SelectItem[] = [
  { label: "Table Service", value: "TABLE" },
  { label: "Room Service", value: "ROOM" },
];

const EMPTY_ITEM: CreateKotItemInput = {
  product_id: 0,
  qty: 1,
  rate_at_time: 0,
  remarks: null,
  status: "Normal",
};

const getApiErrorMessage = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

const KotEntryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const kotId = route.params?.kotId;
  const isView = !!kotId;

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<KotDetailResponse | null>(null);

  const [kotNo, setKotNo] = useState("");
  const [notes, setNotes] = useState("");
  const [tableNo, setTableNo] = useState(route.params?.table_no || "");
  const [bookingId, setBookingId] = useState<number | undefined>(
    route.params?.booking_id
  );
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

  const [orderErrors, setOrderErrors] = useState<{
    table?: string;
    room?: string;
    items?: string;
  }>({});

  const loadProducts = useCallback(async () => {
    try {
      const res = await productApi.list();
      setProducts(Array.isArray(res) ? res : []);
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to load products"));
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetchInHouseRooms();
      setRooms(Array.isArray(res) ? res : []);
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to load rooms"));
    }
  }, []);

  const loadKot = useCallback(async (id: number) => {
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
        (res.items || []).map((item) => ({
          product_id: item.product_id,
          qty: Number(item.qty) || 0,
          rate_at_time: Number(item.rate_at_time) || 0,
          remarks: item.remarks || null,
          status: item.status || "Normal",
        }))
      );
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to load KOT"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (kotId) {
      loadKot(kotId);
    } else if (items.length === 0) {
      setItems([{ ...EMPTY_ITEM }]);
    }
  }, [kotId, loadKot, items.length]);

  useEffect(() => {
    if (!isView && serviceType === "ROOM") {
      loadRooms();
    }
  }, [serviceType, isView, loadRooms]);

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

  const getProductName = (productId: number, index: number) => {
    const product = products.find((p) => p.product_id === productId);
    if (product?.product_name) return product.product_name;
    return detail?.items?.[index]?.product_name || "";
  };

  const getSelectedRoomLabel = () => {
    const room = rooms.find((r) => r.booking_id === bookingId);
    if (room?.display_label) return room.display_label;
    if (detail?.kot?.display_label) return detail.kot.display_label;
    if (detail?.kot?.room_no) return `Room ${detail.kot.room_no}`;
    return "";
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
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
                row.rate_at_time != null && Number(row.rate_at_time) > 0
                  ? Number(row.rate_at_time)
                  : Number(product.rate) || 0,
            }
          : row
      )
    );

    setPickerVisible(false);
    setSelectedRowIndex(null);
    setOrderErrors((prev) => ({ ...prev, items: "" }));
  };

  const onSelectServiceType = (item: SelectItem) => {
    const next = item.value as KotServiceType;
    setServiceType(next);

    if (next === "TABLE") {
      setBookingId(undefined);
      setRoomId(undefined);
      setOrderErrors((prev) => ({ ...prev, room: "" }));
    } else {
      setTableNo("");
      setOrderErrors((prev) => ({ ...prev, table: "" }));
      if (!isView) loadRooms();
    }

    setServiceTypePickerVisible(false);
  };

  const onSelectRoom = (item: SelectItem) => {
    const selected = rooms.find((r) => r.booking_id === Number(item.value));
    if (!selected) return;

    setBookingId(selected.booking_id);
    setRoomId(selected.room_id ?? undefined);
    setRoomPickerVisible(false);
    setOrderErrors((prev) => ({ ...prev, room: "" }));
  };

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.qty) || 0) * (Number(item.rate_at_time ?? 0) || 0),
        0
      ),
    [items]
  );

  const currentKotServiceType: KotServiceType =
    detail?.kot?.service_type || serviceType || "TABLE";

  const isRoomKot = currentKotServiceType === "ROOM";

  const currentKotStatus = detail?.kot?.status || "Open";

  const canEditOrCancel =
    !!detail &&
    currentKotStatus === "Open" &&
    currentKotServiceType === "TABLE";

  const fieldsDisabled = isView && !canEditOrCancel;

  const validate = () => {
    const nextErrors: typeof orderErrors = {};

    if (items.length === 0) {
      nextErrors.items = "Please add at least one item";
    } else {
      const hasInvalid = items.some(
        (item) =>
          !item.product_id ||
          Number(item.qty) <= 0 ||
          Number(item.rate_at_time ?? 0) < 0
      );

      if (hasInvalid) {
        nextErrors.items =
          "Each item must have product, qty > 0, and valid rate";
      }
    }

    if (currentKotServiceType === "TABLE" && !tableNo.trim()) {
      nextErrors.table = "Table no is required for table KOT";
    }

    if (currentKotServiceType === "ROOM" && !bookingId) {
      nextErrors.room = "Please select a checked-in room";
    }

    setOrderErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      Alert.alert("Validation", "Please fix the highlighted fields.");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    const payload: CreateKotPayload = {
      service_type: currentKotServiceType,
      table_no: currentKotServiceType === "TABLE" ? tableNo.trim() : undefined,
      booking_id: currentKotServiceType === "ROOM" ? bookingId : undefined,
      room_id: currentKotServiceType === "ROOM" ? roomId : undefined,
      notes: notes.trim() || undefined,
      items: items.map((item) => ({
        product_id: item.product_id,
        qty: Number(item.qty) || 0,
        rate_at_time: Number(item.rate_at_time ?? 0) || 0,
        remarks: item.remarks || null,
        status: item.status || "Normal",
      })),
    };

    try {
      setLoading(true);
      const res = await createKot(payload);

      const successMessage =
        currentKotServiceType === "ROOM"
          ? `Room service KOT created.\nCharges are posted to the guest folio.\nKOT No: ${res.kot.kot_no}`
          : `KOT created successfully.\nKOT No: ${res.kot.kot_no}`;

      Alert.alert("Success", successMessage, [
        {
          text: "Open",
          onPress: () =>
            navigation.replace("KotEntry", {
              kotId: res.kot.kot_id,
              refreshOnFocus: true,
            }),
        },
        {
          text: "Back to List",
          onPress: () =>
            navigation.navigate("KOTList", { refreshOnFocus: true }),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to create KOT"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !kotId) return;

    try {
      setLoading(true);
      await updateKot(kotId, {
        service_type: currentKotServiceType,
        table_no: currentKotServiceType === "TABLE" ? tableNo.trim() : undefined,
        booking_id: currentKotServiceType === "ROOM" ? bookingId : undefined,
        room_id: currentKotServiceType === "ROOM" ? roomId : undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          qty: Number(item.qty) || 0,
          rate_at_time: Number(item.rate_at_time ?? 0) || 0,
          remarks: item.remarks || null,
          status: item.status || "Normal",
        })),
      });

      Alert.alert("Success", "KOT updated successfully");
      await loadKot(kotId);
    } catch (e: any) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to update KOT"));
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
            Alert.alert("Error", getApiErrorMessage(e, "Failed to cancel KOT"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteKot = async () => {
    if (!kotId) return;

    Alert.alert(
      "Delete KOT",
      "Delete this KOT? Only open table KOT can be deleted.",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteKot(kotId);
              Alert.alert("Deleted", "KOT deleted", [
                {
                  text: "OK",
                  onPress: () =>
                    navigation.navigate("KOTList", { refreshOnFocus: true }),
                },
              ]);
            } catch (e: any) {
              Alert.alert("Error", getApiErrorMessage(e, "Failed to delete KOT"));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && isView && !detail) {
    return <Loader />;
  }

  const guestName =
    detail?.kot?.first_name || detail?.kot?.last_name
      ? `${detail?.kot?.first_name || ""} ${detail?.kot?.last_name || ""}`.trim()
      : "";

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
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
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Status
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {currentKotStatus}
              </Text>
            </View>

            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹ {totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {kotNo ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              KOT No: {kotNo}
            </Text>
          ) : null}

          {isView && detail?.kot?.kot_datetime ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Date: {formatDateTime(detail.kot.kot_datetime)}
            </Text>
          ) : null}

          {guestName ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Guest: {guestName}
            </Text>
          ) : null}

          {detail?.kot?.room_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Room: {detail.kot.room_no}
            </Text>
          ) : null}

          {detail?.kot?.folio_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Folio: {detail.kot.folio_no}
            </Text>
          ) : null}

          {isRoomKot ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              This room-service KOT is posted to folio and is read-only here.
            </Text>
          ) : null}
        </View>

        <SectionTitle title="Order Info" />

        <AppInput
          label="Service Type"
          value={currentKotServiceType}
          editable={false}
          onPress={!isView ? () => setServiceTypePickerVisible(true) : undefined}
          placeholder="Select service type"
        />

        {currentKotServiceType === "TABLE" ? (
          <>
            <AppInput
              label="Table No"
              value={tableNo}
              onChangeText={(val) => {
                setTableNo(val);
                if (orderErrors.table) {
                  setOrderErrors((prev) => ({ ...prev, table: "" }));
                }
              }}
              placeholder="Enter table number"
              editable={!fieldsDisabled}
            />
            {orderErrors.table ? (
              <Text style={{ color: colors.error, fontSize: 12 }}>
                {orderErrors.table}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <AppInput
              label="Checked-in Room"
              value={getSelectedRoomLabel()}
              editable={false}
              onPress={!isView ? () => setRoomPickerVisible(true) : undefined}
              placeholder="Select checked-in room"
            />
            {orderErrors.room ? (
              <Text style={{ color: colors.error, fontSize: 12 }}>
                {orderErrors.room}
              </Text>
            ) : null}
          </>
        )}

        <AppInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          editable={!fieldsDisabled}
          multiline
          placeholder="Kitchen note / room service note"
        />

        <SectionTitle title="Items" />

        {items.length === 0 && !isView ? (
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
              No items added yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add one or more products to create this KOT
            </Text>
          </View>
        ) : null}

        {orderErrors.items ? (
          <Text
            style={{
              color: colors.error,
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            {orderErrors.items}
          </Text>
        ) : null}

        {items.map((item, index) => (
          <KotItemRow
            key={`${index}-${item.product_id}-${item.qty}-${item.rate_at_time}`}
            index={index}
            value={item}
            productName={getProductName(item.product_id, index)}
            onChange={(next) => updateItem(index, next)}
            onRemove={() => removeItem(index)}
            onSelectProduct={() => openProductPicker(index)}
            disabled={fieldsDisabled}
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
            <AppButton
              title="Save KOT"
              onPress={handleCreate}
              loading={loading}
            />
          </>
        ) : canEditOrCancel ? (
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
        ) : (
          <View
            style={[
              styles.readOnlyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.readOnlyTitle, { color: colors.text }]}>
              Read-only KOT
            </Text>
            <Text
              style={[
                styles.readOnlySubtitle,
                { color: colors.textSecondary },
              ]}
            >
              {isRoomKot
                ? "Room KOT is handled through posting and folio flow."
                : "This KOT is not editable because it is already billed or cancelled."}
            </Text>
          </View>
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
  readOnlyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  readOnlyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  readOnlySubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default KotEntryScreen;