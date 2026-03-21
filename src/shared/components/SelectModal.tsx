// src/shared/components/SelectModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export type SelectItem = {
  label: string;
  value: string | number;
};

type Props = {
  visible: boolean;
  title?: string;
  data: SelectItem[];
  onSelect: (item: SelectItem) => void;
  onClose: () => void;
};

const SelectModal: React.FC<Props> = ({
  visible,
  title = 'Select',
  data,
  onSelect,
  onClose,
}) => {
  const { theme } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {title}
                </Text>
              </View>

              <FlatList
                data={data}
                keyExtractor={(item, idx) => `${item.value}-${idx}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => onSelect(item)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { color: theme.colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                )}
              />

              <TouchableOpacity
                style={styles.cancel}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1,
    maxHeight: '70%',
  },
  header: {
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '600' },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  itemText: {
    fontSize: 14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 13,
  },
});

export default SelectModal;
