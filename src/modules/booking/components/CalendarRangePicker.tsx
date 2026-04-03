// src/modules/booking/components/CalendarRangePicker.tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import AppInput from "../../../shared/components/AppInput";
import { toIsoDate } from "../../../shared/utils/date";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
};

const CalendarRangePicker: React.FC<Props> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const { theme } = useThemeStore();
  const [open, setOpen] = useState(false);

  const parseDate = (value?: string) => {
    if (!value) return undefined;
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const handleDateChange = (date: any, type?: "START_DATE" | "END_DATE") => {
    const jsDate: Date =
      date && typeof date.toDate === "function" ? date.toDate() : date;

    if (!jsDate || Number.isNaN(jsDate.getTime())) return;

    const iso = toIsoDate(jsDate);

    if (type === "START_DATE") {
      onChange(iso, endDate || iso);
    } else {
      onChange(startDate || iso, iso);
      setOpen(false);
    }
  };

  const colors = theme.colors;

  return (
    <View>
      <AppInput
        label="Stay (from – to)"
        value={`${startDate} → ${endDate}`}
        editable={false}
        onPress={() => setOpen((prev) => !prev)}
      />

      {open && (
        <View
          style={{
            marginTop: 8,
            borderRadius: 12,
            backgroundColor: colors.surface,
            paddingVertical: 12,
            paddingHorizontal: 8,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Select stay dates
          </Text>

          <CalendarPicker
            allowRangeSelection
            selectedStartDate={parseDate(startDate)}
            selectedEndDate={parseDate(endDate)}
            onDateChange={handleDateChange}
            textStyle={{
              color: colors.text,
              fontSize: 14,
            }}
            todayBackgroundColor={colors.primarySoft}
            selectedDayColor={colors.primary}
            selectedDayTextColor={colors.onPrimary || "#ffffff"}
            selectedRangeStartStyle={{
              backgroundColor: colors.primary,
              borderRadius: 999,
            }}
            selectedRangeEndStyle={{
              backgroundColor: colors.primary,
              borderRadius: 999,
            }}
            selectedRangeStyle={{
              backgroundColor: colors.primarySoft,
            }}
            previousTitle="<"
            nextTitle=">"
            previousTitleStyle={{ color: colors.text, fontSize: 18 }}
            nextTitleStyle={{ color: colors.text, fontSize: 18 }}
            monthTitleStyle={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "600",
            }}
            yearTitleStyle={{
              color: colors.textSecondary,
              fontSize: 14,
            }}
            weekdays={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as any}
            weekdaysStyle={{
              color: colors.textSecondary,
              fontSize: 12,
              textAlign: "center",
            }}
            dayShape="circle"
          />
        </View>
      )}
    </View>
  );
};

export default CalendarRangePicker;