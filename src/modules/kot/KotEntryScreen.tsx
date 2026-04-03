import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  View,
  Text,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  KotDetailResponse,
  CreateKotItemInput,
  CreateKotPayload,
  KotServiceType,
} from "../../api/types";
import { createKot, fetchKotDetail } from "./api";
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
    folio_id?: number;
    room_id?: number;
    table_no?: string;
    service_type?: KotServiceType;
  };
};

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
  const [bookingId, setBookingId] = useState<number | undefined>(
    route.params?.booking_id
  );
  const [folioId, setFolioId] = useState<number | undefined>(
    route.params?.folio_id
  );
  const [roomId, setRoomId] = useState<number | undefined>(
    route.params?.room_id
  );
  const [serviceType, setServiceType] = useState<KotServiceType>(
    route.params?.service_type || "TABLE"
  );
  const [items, setItems] = useState<CreateKotItemInput[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (kotId) {
      loadKot(kotId);
    }
  }, [kotId]);

  const loadProducts = async () => {
    try {
      const res = await productApi.list();
      setProducts(res);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load products"
      );
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
      setFolioId(res.kot.folio_id ?? undefined);
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
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load KOT"
      );
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

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.product_id === productId);
    return product?.product_name || "";
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
                row.rate_at_time != null ? row.rate_at_time : product.rate ?? 0,
            }
          : row
      )
    );

    setPickerVisible(false);
    setSelectedRowIndex(null);
  };

  const totalAmount = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.qty) || 0) * (Number(item.rate_at_time ?? 0) || 0),
    0
  );

  const validate = () => {
    if (items.length === 0) {
      Alert.alert("Validation", "Please add at least one item");
      return false;
    }

    const hasInvalid = items.some(
      (item) =>
        !item.product_id ||
        Number(item.qty) <= 0 ||
        Number(item.rate_at_time ?? 0) < 0
    );

    if (hasInvalid) {
      Alert.alert(
        "Validation",
        "Each item must have product, qty greater than 0, and valid rate"
      );
      return false;
    }

    if (serviceType === "TABLE" && !tableNo.trim()) {
      Alert.alert("Validation", "Table no is required for table KOT");
      return false;
    }

    if (serviceType === "ROOM" && !bookingId && !roomId) {
      Alert.alert(
        "Validation",
        "For room service KOT, booking ID or room ID is required"
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: CreateKotPayload = {
      service_type: serviceType,
      kot_datetime: undefined,
      table_no: serviceType === "TABLE" ? tableNo.trim() || undefined : undefined,
      booking_id: serviceType === "ROOM" ? bookingId ?? undefined : undefined,
      room_id: serviceType === "ROOM" ? roomId ?? undefined : undefined,
      notes: notes.trim() || undefined,
      items,
    };

    try {
      setLoading(true);
      const res = await createKot(payload);
      Alert.alert("Success", "KOT created successfully", [
        {
          text: "Open",
          onPress: () =>
            navigation.replace("KotEntry", { kotId: res.kot.kot_id }),
        },
        {
          text: "Back to List",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to create KOT"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isView && !detail) {
    return <Loader />;
  }

  const guestName =
    detail?.kot?.first_name || detail?.kot?.last_name
      ? `${detail?.kot?.first_name || ""} ${
          detail?.kot?.last_name || ""
        }`.trim()
      : "";

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          title={isView ? "KOT Detail" : "New KOT"}
          subtitle={isView ? `KOT #${kotId}` : "Create kitchen order"}
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
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Status
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.primary },
                ]}
              >
                {detail?.kot?.status || "Open"}
              </Text>
            </View>

            <View>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Total
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.text }]}
              >
                ₹ {totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

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
          label="KOT No"
          value={kotNo}
          onChangeText={setKotNo}
          placeholder="Auto generate if left blank"
          editable={!isView}
        />

        <AppInput
          label="Service Type"
          value={serviceType}
          editable={false}
          placeholder="TABLE / ROOM"
        />

        <AppInput
          label="Table No"
          value={tableNo}
          onChangeText={setTableNo}
          placeholder="Optional for restaurant orders"
          editable={!isView}
        />

        <View style={styles.inlineRow}>
          <View style={styles.inlineCol}>
            <AppInput
              label="Booking ID"
              value={bookingId ? String(bookingId) : ""}
              onChangeText={(text) =>
                setBookingId(text ? Number(text) : undefined)
              }
              editable={!isView}
              keyboardType="numeric"
              placeholder="Optional"
            />
          </View>

          <View style={styles.inlineCol}>
            <AppInput
              label="Room ID"
              value={roomId ? String(roomId) : ""}
              onChangeText={(text) => setRoomId(text ? Number(text) : undefined)}
              editable={!isView}
              keyboardType="numeric"
              placeholder="Optional"
            />
          </View>
        </View>

        <AppInput
          label="Folio ID"
          value={folioId ? String(folioId) : ""}
          onChangeText={(text) => setFolioId(text ? Number(text) : undefined)}
          editable={!isView}
          keyboardType="numeric"
          placeholder="Optional; backend auto-link via booking"
        />

        <AppInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          editable={!isView}
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
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
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
            disabled={isView}
          />
        ))}

        {!isView && (
          <>
            <AppButton
              title="Add Item"
              variant="outline"
              onPress={addItem}
              style={{ marginBottom: 12 }}
            />
            <AppButton
              title="Save KOT"
              onPress={handleSave}
              loading={loading}
            />
          </>
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
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
  inlineRow: {
    flexDirection: "row",
  },
  inlineCol: {
    flex: 1,
    marginRight: 8,
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