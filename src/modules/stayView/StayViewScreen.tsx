import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useBookingStore } from "../booking/store";
import { useThemeStore } from "../../store/themeStore";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { bookingApi } from "../../api/bookingApi";
import { postingApi, RoomPosting } from "../../api/postingApi";
import PostingList from "./components/PostingList";

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
        (detail as any)?.booking || (detail as any)?.data || detail || currentBooking;

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
    } catch (e) {
      console.log("load postings error", e);
      Alert.alert("Error", "Could not load folio postings.");
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

  const isCheckedIn = String(currentBooking.status || "") === "CheckedIn";
  const isCheckedOut = String(currentBooking.status || "") === "CheckedOut";

  const grossAmount = postings.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );
  const taxAmount = postings.reduce(
    (sum, row) => sum + Number(row.tax_amount || 0),
    0
  );
  const netAmount = grossAmount + taxAmount;

  const runCheckoutOnly = async () => {
    if (checkoutLoading || !bookingId) return;

    try {
      setCheckoutLoading(true);
      const updated = await bookingApi.checkOut(bookingId);

      setCurrentManual(
        {
          ...currentBooking,
          ...updated,
          status: updated?.status || "CheckedOut",
        },
        {
          folio_id: resolvedFolioId,
          folio_no: resolvedFolioNo,
        }
      );

      Alert.alert("Checked out", "Guest has been checked out.");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Could not check out."
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
          ...updated,
          status: updated?.status || "CheckedOut",
        },
        {
          folio_id: resolvedFolioId,
          folio_no: resolvedFolioNo,
        }
      );

      const summary = await bookingApi.billing(bookingId);
      const existingBills = Array.isArray(summary?.bills) ? summary.bills : [];
      if (existingBills.length > 0) {
        Alert.alert(
          "Bill Exists",
          "A bill already exists for this stay."
        );
        return;
      }

      const res = await bookingApi.createBillFromBooking(bookingId, true);

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
        Alert.alert(
          "Bill Exists",
          "A bill already exists for this stay."
        );
        return;
      }

      const res = await bookingApi.createBillFromBooking(bookingId, true);

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
        e?.response?.data?.message ||
          e?.message ||
          "Could not generate bill."
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
        `Posting ID: ${res.posting_id}\nAmount: ${Number(res.amount).toFixed(2)}`
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
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        Stay details
      </Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Booking: #{currentBooking.booking_id}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Room: {currentBooking.room_id}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Guest ID: {currentBooking.guest_id}
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textSecondary }}>
          Folio: {folioLoading ? "Loading..." : resolvedFolioNo} (ID:{" "}
          {folioLoading ? "..." : resolvedFolioId || 0})
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Status: {currentBooking.status}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Check-in:{" "}
          {formatDateTime(
            currentBooking.actual_check_in_datetime ||
              currentBooking.check_in_datetime
          )}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Planned Check-out: {formatDateTime(currentBooking.check_out_datetime)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
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

        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Postings: {postingsLoading ? "Loading..." : postings.length}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Gross: ₹ {grossAmount.toFixed(2)}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Tax: ₹ {taxAmount.toFixed(2)}
        </Text>
        <Text style={{ color: colors.text, fontWeight: "700" }}>
          Net: ₹ {netAmount.toFixed(2)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
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
          Folio postings
        </Text>

        <PostingList
          data={postings}
          loading={postingsLoading}
          canEdit={isCheckedIn}
          onChanged={loadPostings}
        />
      </View>

      <View style={{ marginTop: 8 }}>
        <View style={{ marginBottom: 10 }}>
          <AppButton
            title={roomRentLoading ? "Posting..." : "Post Room Rent"}
            onPress={handlePostRoomRent}
            disabled={roomRentLoading || !isCheckedIn}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <AppButton
              title={checkoutLoading ? "Checking out..." : "Check-out"}
              onPress={runCheckoutOnly}
              disabled={checkoutLoading || !isCheckedIn}
              size="small"
            />
          </View>

          <View style={{ flex: 1, marginRight: 8 }}>
            <AppButton
              title="Add Charge"
              onPress={handleAddCharge}
              disabled={!isCheckedIn}
              variant="outline"
              size="small"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppButton
              title={
                billingLoading
                  ? "Processing..."
                  : isCheckedOut
                  ? "Create Bill"
                  : "Checkout / Bill"
              }
              onPress={handleBillingPress}
              disabled={billingLoading || !bookingId}
              size="small"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StayViewScreen;