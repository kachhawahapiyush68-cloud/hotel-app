// src/modules/booking/components/GuestPicker.tsx
import React, { useEffect, useState } from "react";
import AppInput from "../../../shared/components/AppInput";
import SelectModal, {
  SelectItem,
} from "../../../shared/components/SelectModal";
import { guestApi } from "../../../api/guestApi";

type Props = {
  value?: number;
  onChange: (guestId: number) => void;
};

export const GuestPicker: React.FC<Props> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<SelectItem[]>([]);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const guests = await guestApi.list();
        const data: SelectItem[] = guests.map((g: any) => {
          const name = `${g.first_name ?? ""} ${g.last_name ?? ""}`.trim();
          return {
            value: g.guest_id,
            label: name || g.mobile || `Guest #${g.guest_id}`,
          };
        });
        setItems(data);

        if (value) {
          const current = data.find((x) => x.value === value);
          if (current) setLabel(current.label);
        }
      } catch (e) {
        console.log("GuestPicker load error", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!value || items.length === 0) return;
    const current = items.find((x) => x.value === value);
    if (current) setLabel(current.label);
  }, [value, items]);

  const handleSelect = (item: SelectItem) => {
    setVisible(false);
    setLabel(item.label);
    onChange(Number(item.value));
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
      <SelectModal
        visible={visible}
        title="Select Guest"
        data={items}
        onSelect={handleSelect}
        onClose={() => setVisible(false)}
      />
    </>
  );
};
