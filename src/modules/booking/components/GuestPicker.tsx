import React, { useEffect, useState } from "react";
import { Alert, Modal, View } from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import SelectModal, {
  SelectItem,
} from "../../../shared/components/SelectModal";
import { guestApi, Guest } from "../../../api/guestApi";
import GuestForm from "../../masters/components/GuestForm";
import SectionTitle from "../../../shared/components/SectionTitle";
import { useThemeStore } from "../../../store/themeStore";

type Props = {
  value?: number;
  onChange: (guestId: number) => void;
};

export const GuestPicker: React.FC<Props> = ({ value, onChange }) => {
  const { theme } = useThemeStore();

  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<SelectItem[]>([]);
  const [label, setLabel] = useState<string>("");

  const [guestFormVisible, setGuestFormVisible] = useState(false);
  const [savingGuest, setSavingGuest] = useState(false);

  const loadGuests = async (selectedGuestId?: number) => {
    try {
      const guests = await guestApi.list();
      const data: SelectItem[] = guests.map((g: Guest) => {
        const name = `${g.first_name ?? ""} ${g.last_name ?? ""}`.trim();
        return {
          value: g.guest_id,
          label: name || g.mobile || `Guest #${g.guest_id}`,
        };
      });

      setItems(data);

      const finalId = selectedGuestId ?? value;
      if (finalId) {
        const current = data.find((x) => Number(x.value) === Number(finalId));
        if (current) {
          setLabel(current.label);
        }
      }
    } catch (e) {
      console.log("GuestPicker load error", e);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    if (!value || items.length === 0) return;
    const current = items.find((x) => Number(x.value) === Number(value));
    if (current) setLabel(current.label);
  }, [value, items]);

  const handleSelect = (item: SelectItem) => {
    setVisible(false);
    setLabel(item.label);
    onChange(Number(item.value));
  };

  const handleCreateGuest = async (values: {
    title?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    document_type?: string | null;
    document_no?: string | null;
    gst_no?: string | null;
    remarks?: string | null;
  }) => {
    try {
      setSavingGuest(true);

      const created = await guestApi.create(values);

      await loadGuests(created.guest_id);
      onChange(created.guest_id);

      const createdName =
        `${created.first_name ?? ""} ${created.last_name ?? ""}`.trim() ||
        created.mobile ||
        `Guest #${created.guest_id}`;

      setLabel(createdName);
      setGuestFormVisible(false);

      Alert.alert("Success", "Guest added successfully");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to create guest"
      );
    } finally {
      setSavingGuest(false);
    }
  };

  return (
    <>
      <AppInput
        label="Guest"
        value={label}
        placeholder="Select guest"
        editable={false}
        onPress={() => setVisible(true)}
      />

      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <AppButton
          title="Add Guest"
          variant="outline"
          onPress={() => setGuestFormVisible(true)}
        />
      </View>

      <SelectModal
        visible={visible}
        title="Select Guest"
        data={items}
        onSelect={handleSelect}
        onClose={() => setVisible(false)}
      />

      <Modal
        visible={guestFormVisible}
        animationType="slide"
        onRequestClose={() => setGuestFormVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
          }}
        >
          <SectionTitle title="Add Guest" />
          <GuestForm
            submitting={savingGuest}
            onSubmit={handleCreateGuest}
          />
          <AppButton
            title="Close"
            variant="outline"
            onPress={() => setGuestFormVisible(false)}
            style={{ margin: 16 }}
          />
        </View>
      </Modal>
    </>
  );
};