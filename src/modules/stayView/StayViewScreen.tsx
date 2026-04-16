import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useBookingStore } from "../booking/store";
import { useThemeStore } from "../../store/themeStore";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import {
  bookingApi,
  getBookingGuestName,
  getBookingRoomLabel,
  getBookingMetaLine,
} from "../../api/bookingApi";
import { postingApi, RoomPosting } from "../../api/postingApi";
import PostingList from "./components/PostingList";

const EXCLUDED_SUMMARY_TYPES = new Set(["TAXI"]);

const StayViewScreen: React.FC = () => {
  const { currentBooking, currentFolio, setCurrentManual } = useBookingStore();
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const colors = theme.colors;

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [roomRentLoading, setRoomRentLoading] = useState(false);
  const [postingsLoading, setPostingsLoading] = useState(false);
  const [folioLoading, setFolioLoading] = useState(false);
  const [postings, setPostings] = useState<RoomPosting[]>([]);

  const bookingId = Number(currentBooking?.booking_id || 0);

  const resolvedFolioId = useMemo(() => {
    const fromFolio = Number(currentFolio?.folio_id || 0);
    const fromBooking = Number((currentBooking as any)?.folio_id || 0);
    return fromFolio > 0 ? fromFolio : fromBooking > 0 ? fromBooking : 0;
  }, [currentBooking, currentFolio]);

  const resolvedFolioNo = useMemo(() => {
    return (
      currentFolio?.folio_no ||
      (currentBooking as any)?.folio_no ||
      (resolvedFolioId ? `FOL-${resolvedFolioId}` : "-")
    );
  }, [currentBooking, currentFolio, resolvedFolioId]);

  const guestName = useMemo(
    () => getBookingGuestName(currentBooking || undefined),
    [currentBooking]
  );

  const roomLabel = useMemo(
    () => getBookingRoomLabel(currentBooking || undefined),
    [currentBooking]
  );

  const metaLine = useMemo(
    () => getBookingMetaLine(currentBooking || undefined),
    [currentBooking]
  );

  const isCheckedIn = String(currentBooking?.status || "") === "CheckedIn";
  const isCheckedOut = String(currentBooking?.status || "") === "CheckedOut";

  const ensureFolioLoaded = useCallback(async () => {
    if (!bookingId || !currentBooking) return null;

    if (resolvedFolioId > 0) {
      return {
        folio_id: resolvedFolioId,
        folio_no: resolvedFolioNo,
      };
    }

    try {
      setFolioLoading(true);

      const detail = await bookingApi.getById(bookingId);
      const booking =
        (detail as any)?.booking ||
        (detail as any)?.data ||
        detail ||
        currentBooking;

      const folioId = Number(
        booking?.folio_id ||
          booking?.folio?.folio_id ||
          (detail as any)?.folio_id ||
          (detail as any)?.folio?.folio_id ||
          0
      );

      const folioNo =
        booking?.folio_no ||
        booking?.folio?.folio_no ||
        (detail as any)?.folio_no ||
        (detail as any)?.folio?.folio_no ||
        (folioId > 0 ? `FOL-${folioId}` : `FOL-${bookingId}`);

      if (folioId > 0) {
        setCurrentManual(
          {
            ...currentBooking,
            ...booking,
            folio_id: folioId,
            folio_no: folioNo,
          },
          {
            folio_id: folioId,
            folio_no: folioNo,
          }
        );

        return { folio_id: folioId, folio_no: folioNo };
      }

      return null;
    } catch (e) {
      console.log("ensureFolioLoaded error", e);
      return null;
    } finally {
      setFolioLoading(false);
    }
  }, [bookingId, currentBooking, resolvedFolioId, resolvedFolioNo, setCurrentManual]);

  const refreshCurrentBooking = useCallback(async () => {
    if (!bookingId || !currentBooking) return;

    try {
      const detail = await bookingApi.getById(bookingId);
      const nextBooking =
        (detail as any)?.booking ||
        (detail as any)?.data ||
        detail ||
        currentBooking;

      setCurrentManual(
        {
          ...currentBooking,
          ...nextBooking,
        },
        {
          folio_id: Number(
            nextBooking?.folio_id || currentFolio?.folio_id || resolvedFolioId || 0
          ),
          folio_no:
            nextBooking?.folio_no ||
            currentFolio?.folio_no ||
            resolvedFolioNo ||
            "-",
        }
      );
    } catch (e) {
      console.log("refreshCurrentBooking error", e);
    }
  }, [
    bookingId,
    currentBooking,
    currentFolio?.folio_id,
    currentFolio?.folio_no,
    resolvedFolioId,
    resolvedFolioNo,
    setCurrentManual,
  ]);

  const loadPostings = useCallback(async () => {
    if (!currentBooking?.booking_id) {
      setPostings([]);
      return;
    }

    try {
      let folio: { folio_id: number; folio_no: string } | null = null;

      if (resolvedFolioId > 0) {
        folio = { folio_id: resolvedFolioId, folio_no: resolvedFolioNo };
      } else {
        folio = await ensureFolioLoaded();
      }

      if (!folio?.folio_id) {
        setPostings([]);
        return;
      }

      setPostingsLoading(true);
      const rows = await postingApi.listByFolio(folio.folio_id);
      setPostings(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.log("load postings error", e);
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not load folio postings."
      );
    } finally {
      setPostingsLoading(false);
    }
  }, [currentBooking, ensureFolioLoaded, resolvedFolioId, resolvedFolioNo]);

  useFocusEffect(
    useCallback(() => {
      loadPostings();
    }, [loadPostings])
  );

  useEffect(() => {
    loadPostings();
  }, [loadPostings]);

  if (!currentBooking) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color={colors.textSecondary}
          style={{ marginBottom: 8 }}
        />
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          No stay selected.
        </Text>
      </View>
    );
  }

  let chargesAmount = 0;
  let paymentsAmount = 0;
  let discountsAmount = 0;
  let excludedDisplayAmount = 0;

  for (const row of postings) {
    const ct = String(row.charge_type || "").toUpperCase().trim();
    const lineAmount = Number(row.amount || 0) + Number(row.tax_amount || 0);

    if (!Number.isFinite(lineAmount) || lineAmount === 0) continue;

    if (EXCLUDED_SUMMARY_TYPES.has(ct)) {
      excludedDisplayAmount += lineAmount;
      continue;
    }

    if (
      ct === "ADVANCE" ||
      ct === "PAYMENT" ||
      ct === "CASH" ||
      ct === "BANK" ||
      ct === "UPI" ||
      ct === "CARD"
    ) {
      paymentsAmount += lineAmount;
    } else if (ct === "TC" || ct === "DISCOUNT") {
      discountsAmount += lineAmount;
    } else {
      chargesAmount += lineAmount;
    }
  }

  const netAmount = chargesAmount - discountsAmount - paymentsAmount;

  const runCheckoutOnly = async () => {
    if (checkoutLoading || !bookingId) return;

    try {
      setCheckoutLoading(true);

      const updated = await bookingApi.checkOut(bookingId);

      setCurrentManual(
        {
          ...currentBooking,
          status: updated?.status || "CheckedOut",
        },
        {
          folio_id: resolvedFolioId,
          folio_no: resolvedFolioNo,
        }
      );

      await refreshCurrentBooking();
      await loadPostings();

      Alert.alert("Checked out", "Guest has been checked out.");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not check out."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const runCheckoutAndBill = async () => {
    if (!bookingId) return;

    try {
      setBillingLoading(true);

      const updated = await bookingApi.checkOut(bookingId);

      setCurrentManual(
        {
          ...currentBooking,
          status: updated?.status || "CheckedOut",
        },
        {
          folio_id: resolvedFolioId,
          folio_no: resolvedFolioNo,
        }
      );

      await refreshCurrentBooking();

      const summary = await bookingApi.billing(bookingId);
      const existingBills = Array.isArray(summary?.bills) ? summary.bills : [];
      if (existingBills.length > 0) {
        Alert.alert("Bill Exists", "A bill already exists for this stay.");
        return;
      }

      const res = await bookingApi.createBillFromBooking(bookingId, false);

      Alert.alert("Success", `Bill no: ${res.bill.bill_no}`, [
        {
          text: "Open Bill",
          onPress: () =>
            navigation.navigate("BillDetail", {
              billId: res.bill.bill_id,
            }),
        },
        { text: "OK" },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Could not checkout and generate bill."
      );
    } finally {
      setBillingLoading(false);
    }
  };

  const runBillOnly = async () => {
    if (!bookingId) return;

    try {
      setBillingLoading(true);

      const summary = await bookingApi.billing(bookingId);
      const existingBills = Array.isArray(summary?.bills) ? summary.bills : [];
      if (existingBills.length > 0) {
        Alert.alert("Bill Exists", "A bill already exists for this stay.");
        return;
      }

      const res = await bookingApi.createBillFromBooking(bookingId, false);

      Alert.alert("Bill generated", `Bill no: ${res.bill.bill_no}`, [
        {
          text: "Open Bill",
          onPress: () =>
            navigation.navigate("BillDetail", {
              billId: res.bill.bill_id,
            }),
        },
        { text: "OK" },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not generate bill."
      );
    } finally {
      setBillingLoading(false);
    }
  };

  const handleBillingPress = () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking not found.");
      return;
    }

    if (!isCheckedOut) {
      Alert.alert(
        "Checkout required",
        "Guest is still checked in. What do you want to do?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Only Checkout", onPress: runCheckoutOnly },
          { text: "Checkout & Create Bill", onPress: runCheckoutAndBill },
        ]
      );
      return;
    }

    Alert.alert(
      "Generate Bill",
      "Generate final bill for this checked-out stay?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Generate Bill", onPress: runBillOnly },
      ]
    );
  };

  const handleAddCharge = async () => {
    if (!isCheckedIn) {
      Alert.alert("Not allowed", "Charges can be added only before checkout.");
      return;
    }

    let folio = null;

    if (resolvedFolioId > 0) {
      folio = { folio_id: resolvedFolioId, folio_no: resolvedFolioNo };
    } else {
      folio = await ensureFolioLoaded();
    }

    if (!folio?.folio_id) {
      Alert.alert("Error", "Folio not found for this stay.");
      return;
    }

    navigation.navigate("AddCharge");
  };

  const handlePostRoomRent = async () => {
    if (roomRentLoading || !bookingId) return;

    if (!isCheckedIn) {
      Alert.alert(
        "Not allowed",
        "Room rent can be posted only while guest is checked in."
      );
      return;
    }

    try {
      setRoomRentLoading(true);

      const res = await postingApi.postRoomRent({
        booking_id: bookingId,
      });

      await loadPostings();

      Alert.alert(
        "Room rent posted",
        `Amount: ₹ ${Number(res.amount).toFixed(2)}`
      );
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Could not post room rent."
      );
    } finally {
      setRoomRentLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 4,
          }}
        >
          {guestName}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {roomLabel}
        </Text>

        {!!metaLine && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {metaLine}
          </Text>
        )}

        {!!currentBooking.reservation_no && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Reservation: {currentBooking.reservation_no}
          </Text>
        )}

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Status: {currentBooking.status}
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Folio: {resolvedFolioNo}
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Check-in:{" "}
          {formatDateTime(
            currentBooking.actual_check_in_datetime ||
              currentBooking.check_in_datetime
          )}
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Check-out:{" "}
          {formatDateTime(
            currentBooking.actual_check_out_datetime ||
              currentBooking.check_out_datetime
          )}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Folio summary
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Charges: ₹ {chargesAmount.toFixed(2)}
        </Text>

        <Text
          style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
        >
          Discounts: ₹ {discountsAmount.toFixed(2)}
        </Text>

        <Text
          style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
        >
          Payments / Advance: ₹ {paymentsAmount.toFixed(2)}
        </Text>

        {excludedDisplayAmount > 0 && (
          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Taxi / Display Only: ₹ {excludedDisplayAmount.toFixed(2)}
          </Text>
        )}

        <Text
          style={{
            color: colors.text,
            fontSize: 13,
            fontWeight: "700",
            marginTop: 6,
          }}
        >
          Total Due: ₹ {netAmount.toFixed(2)}
        </Text>

        {(folioLoading || postingsLoading) && (
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }}>
            Loading folio details...
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 12 }}>
        <AppButton
          title={roomRentLoading ? "Posting..." : "Post Room Rent"}
          onPress={handlePostRoomRent}
          disabled={roomRentLoading || !isCheckedIn}
          style={{ marginBottom: 8 }}
        />

        <AppButton
          title="Add Extra Charge"
          variant="outline"
          onPress={handleAddCharge}
          disabled={!isCheckedIn}
          style={{ marginBottom: 8 }}
        />

        <AppButton
          title={
            billingLoading
              ? "Processing..."
              : isCheckedOut
              ? "Generate Bill"
              : "Checkout / Billing"
          }
          onPress={handleBillingPress}
          disabled={billingLoading || checkoutLoading}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 14,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          Postings
        </Text>

        <PostingList
          data={postings}
          loading={postingsLoading}
          canEdit={!isCheckedOut}
          onChanged={loadPostings}
        />
      </View>
    </ScrollView>
  );
};

export default StayViewScreen;