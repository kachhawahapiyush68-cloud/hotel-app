import React, { useEffect, useState } from "react";
import AppInput from "../../../shared/components/AppInput";
import SelectModal, {
  SelectItem,
} from "../../../shared/components/SelectModal";
import { roomApi } from "../../../api/roomApi";

type Props = {
  value?: number;
  onChange: (roomId: number) => void;
};

export const RoomPicker: React.FC<Props> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<SelectItem[]>([]);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const rooms = await roomApi.list();
        const data: SelectItem[] = rooms.map((r: any) => {
          const roomNo = r.room_no ?? `Room #${r.room_id}`;
          const category = r.category_name || r.category?.category_name || "";
          const status = r.status ? ` • ${r.status}` : "";
          const text = category
            ? `${roomNo} • ${category}${status}`
            : `${roomNo}${status}`;
          return { value: r.room_id, label: text };
        });
        setItems(data);

        if (value) {
          const current = data.find((x) => Number(x.value) === Number(value));
          if (current) setLabel(current.label);
        }
      } catch (e) {
        console.log("RoomPicker load error", e);
      }
    };
    load();
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

  return (
    <>
      <AppInput
        label="Room"
        value={label}
        placeholder="Select room"
        editable={false}
        onPress={() => setVisible(true)}
      />
      <SelectModal
        visible={visible}
        title="Select Room"
        data={items}
        onSelect={handleSelect}
        onClose={() => setVisible(false)}
      />
    </>
  );
};