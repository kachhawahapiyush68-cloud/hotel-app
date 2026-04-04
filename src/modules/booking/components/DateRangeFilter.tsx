import React, { useState } from "react";
import { View, Text, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import { useThemeStore } from "../../../store/themeStore";
import { toIsoDate } from "../../../shared/utils/date";

type Props = {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
};

const DateRangeFilter: React.FC<Props> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const parse = (iso: string) => {
    if (!iso) return new Date();
    const [y, m, d] = iso.split("-").map((n) => Number(n));
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const handleFromChange = (_: any, date?: Date) => {
    if (Platform.OS !== "ios") setShowFrom(false);
    if (!date) return;
    const iso = toIsoDate(date);
    onChange(iso, endDate || iso);
  };

  const handleToChange = (_: any, date?: Date) => {
    if (Platform.OS !== "ios") setShowTo(false);
    if (!date) return;
    const iso = toIsoDate(date);
    onChange(startDate || iso, iso);
  };

  const setToday = () => {
    const iso = toIsoDate(new Date());
    onChange(iso, iso);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const iso = toIsoDate(d);
    onChange(iso, iso);
  };

  const setLast7 = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    onChange(toIsoDate(start), toIsoDate(end));
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onChange(toIsoDate(start), toIsoDate(end));
  };

  const setAllData = () => {
    onChange("2026-01-01", "2026-12-31");
  };

  return (
    <View>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        Filter by stay (From / To)
      </Text>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <AppInput
            label="From"
            value={startDate}
            editable={false}
            onPress={() => setShowFrom(true)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppInput
            label="To"
            value={endDate}
            editable={false}
            onPress={() => setShowTo(true)}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 8,
        }}
      >
        <AppButton
          title="Today"
          size="small"
          onPress={setToday}
          style={{ marginRight: 6, marginBottom: 6 }}
        />
        <AppButton
          title="Yesterday"
          size="small"
          onPress={setYesterday}
          style={{ marginRight: 6, marginBottom: 6 }}
        />
        <AppButton
          title="Last 7 days"
          size="small"
          onPress={setLast7}
          style={{ marginRight: 6, marginBottom: 6 }}
        />
        <AppButton
          title="This month"
          size="small"
          onPress={setThisMonth}
          style={{ marginRight: 6, marginBottom: 6 }}
        />
        <AppButton
          title="All current data"
          size="small"
          onPress={setAllData}
          style={{ marginRight: 6, marginBottom: 6 }}
        />
      </View>

      {showFrom && (
        <Modal transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "#00000066",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                width: "90%",
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Select From date
              </Text>
              <DateTimePicker
                value={parse(startDate)}
                mode="date"
                display="default"
                onChange={handleFromChange}
              />
              <View style={{ marginTop: 8 }}>
                <AppButton title="Close" onPress={() => setShowFrom(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showTo && (
        <Modal transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "#00000066",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                width: "90%",
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Select To date
              </Text>
              <DateTimePicker
                value={parse(endDate)}
                mode="date"
                display="default"
                onChange={handleToChange}
              />
              <View style={{ marginTop: 8 }}>
                <AppButton title="Close" onPress={() => setShowTo(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DateRangeFilter;