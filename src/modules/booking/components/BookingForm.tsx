// src/modules/booking/BookingForm.tsx
import React, { useState } from "react";
import { View } from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import { useThemeStore } from "../../../store/themeStore";
import { BookingCreateInput } from "../../../api/bookingApi";
import { toIsoDate, toMysqlDateTime } from "../../../shared/utils/date";
import { GuestPicker } from "../components/GuestPicker";
import { RoomPicker } from "../components/RoomPicker";
import CalendarRangePicker from "../components/CalendarRangePicker";

type Props = {
  initial?: Partial<BookingCreateInput>;
  onSubmit: (values: BookingCreateInput) => Promise<void> | void;
  submitting?: boolean;
};

const BookingForm: React.FC<Props> = ({
  initial = {},
  onSubmit,
  submitting,
}) => {
  const { theme } = useThemeStore();

  const [guestId, setGuestId] = useState<number | undefined>(
    initial.guest_id,
  );
  const [roomId, setRoomId] = useState<number | undefined>(
    initial.room_id,
  );

  // dates (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>(
    initial.check_in_datetime
      ? toIsoDate(initial.check_in_datetime)
      : toIsoDate(new Date()),
  );
  const [endDate, setEndDate] = useState<string>(
    initial.check_out_datetime
      ? toIsoDate(initial.check_out_datetime)
      : toIsoDate(new Date()),
  );

  // times (HH:mm)
  const [checkInTime, setCheckInTime] = useState<string>("14:00");
  const [checkOutTime, setCheckOutTime] = useState<string>("11:00");

  const [nights, setNights] = useState(String(initial.nights ?? 1));
  const [numAdult, setNumAdult] = useState(
    String(initial.num_adult ?? 1),
  );
  const [numChild, setNumChild] = useState(
    String(initial.num_child ?? 0),
  );

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const buildDateTime = (date: string, time: string): string => {
    // "YYYY-MM-DD" + "HH:mm" -> Date -> MySQL DATETIME
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const dt = new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
    return toMysqlDateTime(dt);
  };

  const handleSubmit = () => {
    if (!guestId || !roomId) {
      return;
    }

    const checkInDT = buildDateTime(startDate, checkInTime);
    const checkOutDT = buildDateTime(endDate, checkOutTime);

    const payload: BookingCreateInput = {
      guest_id: guestId,
      room_id: roomId,
      check_in_datetime: checkInDT,
      check_out_datetime: checkOutDT,
      nights: Number(nights) || 1,
      num_adult: Number(numAdult) || 1,
      num_child: Number(numChild) || 0,
    };

    onSubmit(payload);
  };

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <GuestPicker value={guestId} onChange={setGuestId} />
      <RoomPicker value={roomId} onChange={setRoomId} />

      <CalendarRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
      />

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={{ flex: 1, marginRight: 4 }}>
          <AppInput
            label="Check-in time"
            value={checkInTime}
            placeholder="HH:mm"
            onChangeText={setCheckInTime}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 4 }}>
          <AppInput
            label="Check-out time"
            value={checkOutTime}
            placeholder="HH:mm"
            onChangeText={setCheckOutTime}
          />
        </View>
      </View>

      <AppInput
        label="Nights"
        value={nights}
        keyboardType="numeric"
        onChangeText={setNights}
      />
      <AppInput
        label="Adults"
        value={numAdult}
        keyboardType="numeric"
        onChangeText={setNumAdult}
      />
      <AppInput
        label="Children"
        value={numChild}
        keyboardType="numeric"
        onChangeText={setNumChild}
      />

      <AppButton
        title={submitting ? "Saving..." : "Save Booking"}
        onPress={handleSubmit}
        loading={submitting}
      />
    </View>
  );
};

export default BookingForm;
