import React, { useMemo, useState } from "react";
import { View, Text } from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import { useThemeStore } from "../../../store/themeStore";
import { BookingCreateInput } from "../../../api/bookingApi";
import { toIsoDate, toMysqlDateTime } from "../../../shared/utils/date";
import { GuestPicker } from "./GuestPicker";
import { RoomPicker } from "./RoomPicker";
import CalendarRangePicker from "./CalendarRangePicker";

type Props = {
  initial?: Partial<BookingCreateInput>;
  onSubmit: (values: BookingCreateInput) => Promise<void> | void;
  submitting?: boolean;
};

const defaultCheckInTime = "14:00";
const defaultCheckOutTime = "11:00";

const extractTime = (datetime?: string, fallback = "00:00") => {
  if (!datetime) return fallback;
  const m = String(datetime).match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : fallback;
};

const BookingForm: React.FC<Props> = ({
  initial = {},
  onSubmit,
  submitting,
}) => {
  const { theme } = useThemeStore();

  const [guestId, setGuestId] = useState<number | undefined>(initial.guest_id);
  const [roomId, setRoomId] = useState<number | undefined>(initial.room_id);

  const initialStartDate = useMemo(
    () =>
      initial.check_in_datetime
        ? toIsoDate(initial.check_in_datetime)
        : toIsoDate(new Date()),
    [initial.check_in_datetime]
  );

  const initialEndDate = useMemo(
    () =>
      initial.check_out_datetime
        ? toIsoDate(initial.check_out_datetime)
        : toIsoDate(new Date()),
    [initial.check_out_datetime]
  );

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  const [checkInTime, setCheckInTime] = useState<string>(
    extractTime(initial.check_in_datetime, defaultCheckInTime)
  );
  const [checkOutTime, setCheckOutTime] = useState<string>(
    extractTime(initial.check_out_datetime, defaultCheckOutTime)
  );

  const [nights, setNights] = useState(String(initial.nights ?? 1));
  const [numAdult, setNumAdult] = useState(String(initial.num_adult ?? 1));
  const [numChild, setNumChild] = useState(String(initial.num_child ?? 0));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const buildDateTime = (date: string, time: string): string => {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const dt = new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
    return toMysqlDateTime(dt);
  };

  const isValidTime = (value: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

  const liveNights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = e.getTime() - s.getTime();
    if (Number.isNaN(diff) || diff < 0) return 0;
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!guestId) nextErrors.guest = "Please select a guest";
    if (!roomId) nextErrors.room = "Please select a room";
    if (!startDate || !endDate) {
      nextErrors.dates = "Please select stay dates";
    }
    if (!isValidTime(checkInTime)) {
      nextErrors.checkInTime = "Invalid check-in time. Use HH:mm";
    }
    if (!isValidTime(checkOutTime)) {
      nextErrors.checkOutTime = "Invalid check-out time. Use HH:mm";
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      nextErrors.dates = "Check-out date cannot be before check-in date";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const checkInDT = buildDateTime(startDate, checkInTime);
    const checkOutDT = buildDateTime(endDate, checkOutTime);

    const payload: BookingCreateInput = {
      guest_id: guestId!,
      room_id: roomId!,
      check_in_datetime: checkInDT,
      check_out_datetime: checkOutDT,
      nights: Number(nights) || liveNights || 1,
      num_adult: Number(numAdult) || 1,
      num_child: Number(numChild) || 0,
      status: initial.status,
      reservation_no: initial.reservation_no ?? null,
      company_id: initial.company_id,
    };

    onSubmit(payload);
  };

  const helperTextColor = theme.colors.textSecondary;

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <GuestPicker value={guestId} onChange={setGuestId} />
      {errors.guest ? (
        <Text style={{ color: theme.colors.error, fontSize: 12 }}>
          {errors.guest}
        </Text>
      ) : null}

      <RoomPicker value={roomId} onChange={setRoomId} />
      {errors.room ? (
        <Text style={{ color: theme.colors.error, fontSize: 12 }}>
          {errors.room}
        </Text>
      ) : null}

      <CalendarRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
      />
      {errors.dates ? (
        <Text style={{ color: theme.colors.error, fontSize: 12 }}>
          {errors.dates}
        </Text>
      ) : (
        <Text
          style={{
            color: helperTextColor,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Stay: {startDate} → {endDate} • {liveNights || 1} night
          {liveNights > 1 ? "s" : ""}
        </Text>
      )}

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={{ flex: 1, marginRight: 4 }}>
          <AppInput
            label="Check-in time"
            value={checkInTime}
            placeholder="HH:mm"
            onChangeText={(val) => {
              setCheckInTime(val);
              if (errors.checkInTime) {
                setErrors((prev) => ({ ...prev, checkInTime: "" }));
              }
            }}
          />
          {errors.checkInTime ? (
            <Text style={{ color: theme.colors.error, fontSize: 12 }}>
              {errors.checkInTime}
            </Text>
          ) : null}
        </View>

        <View style={{ flex: 1, marginLeft: 4 }}>
          <AppInput
            label="Check-out time"
            value={checkOutTime}
            placeholder="HH:mm"
            onChangeText={(val) => {
              setCheckOutTime(val);
              if (errors.checkOutTime) {
                setErrors((prev) => ({ ...prev, checkOutTime: "" }));
              }
            }}
          />
          {errors.checkOutTime ? (
            <Text style={{ color: theme.colors.error, fontSize: 12 }}>
              {errors.checkOutTime}
            </Text>
          ) : null}
        </View>
      </View>

      <AppInput
        label="Nights"
        value={nights}
        keyboardType="numeric"
        onChangeText={setNights}
        helperText={
          liveNights > 0
            ? `Based on dates: ${liveNights} night${liveNights > 1 ? "s" : ""}`
            : undefined
        }
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