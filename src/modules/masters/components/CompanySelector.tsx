// src/modules/masters/components/CompanySelector.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { companyApi, Company } from '../../../api/companyApi';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import AppButton from '../../../shared/components/AppButton';

type Props = {
  onChange: (companyId: number | undefined) => void;
};

const CompanySelector: React.FC<Props> = ({ onChange }) => {
  const { theme } = useThemeStore();
  const user = useAuthStore(s => s.user);
  const selectedCompanyId = useAuthStore(s => s.selectedCompanyId);
  const setSelectedCompanyId = useAuthStore(s => s.setSelectedCompanyId);

  const [list, setList] = useState<Company[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const role = (user?.role || '').toUpperCase();

  const loadCompanies = useCallback(async () => {
    const res = await companyApi.getAll();
    setList(res);
  }, []);

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      loadCompanies();
    }
  }, [role, loadCompanies]);

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      onChange(selectedCompanyId);
    } else {
      onChange(user?.companyid);
    }
  }, [role, selectedCompanyId, user?.companyid, onChange]);

  if (role !== 'SUPER_ADMIN') return null;

  const selected = list.find(c => c.company_id === selectedCompanyId);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Company
      </Text>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.colors.text }}>
          {selected ? selected.company_name : 'Select company'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: theme.colors.text }]}
          >
            Select Company
          </Text>
          <FlatList
            data={list}
            keyExtractor={item => String(item.company_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.companyItem,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() => {
                  setSelectedCompanyId(item.company_id!);
                  setModalVisible(false);
                }}
              >
                <Text style={{ color: theme.colors.text }}>
                  {item.company_name}
                </Text>
              </TouchableOpacity>
            )}
          />
          <AppButton
            title="Close"
            onPress={() => setModalVisible(false)}
            style={{ marginTop: 8 }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 4 },
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalContainer: { flex: 1, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  companyItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});

export default CompanySelector;
