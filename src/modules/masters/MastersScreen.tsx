// src/modules/masters/MastersScreen.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';

type ItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const MasterItem: React.FC<ItemProps> = ({ icon, title, subtitle, onPress }) => {
  const { theme } = useThemeStore();
  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.primarySoft },
        ]}
      >
        <Text style={[styles.iconText, { color: theme.colors.primary }]}>{icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MastersScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Masters</Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        Masters
      </Text>

      <MasterItem
        icon="C"
        title="Companies"
        subtitle="Manage hotel/company profiles"
        onPress={() => navigation.navigate('CompanyList')}
      />
      <MasterItem
        icon="C"
        title="Categories"
        subtitle="Room, POS and other groups"
        onPress={() => navigation.navigate('CategoryList')}
      />
      <MasterItem
        icon="R"
        title="Rooms"
        subtitle="Room types, numbers and status"
        onPress={() => navigation.navigate('RoomList')}
      />
      <MasterItem
        icon="P"
        title="Products"
        subtitle="Extra services and items"
        onPress={() => navigation.navigate('ProductList')}
      />
      <MasterItem
        icon="G"
        title="Guests"
        subtitle="Guest profiles and contacts"
        onPress={() => navigation.navigate('GuestList')}
      />
      <MasterItem
        icon="L"
        title="Ledgers"
        subtitle="Accounts and balances"
        onPress={() => navigation.navigate('LedgerList')}
      />
      <MasterItem
        icon="T"
        title="Tax Groups"
        subtitle="Tax configuration"
        onPress={() => navigation.navigate('TaxGroupList')}
      />
      <MasterItem
        icon="U"
        title="Users"
        subtitle="Admin & employee accounts"
        onPress={() => navigation.navigate('UserList')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontWeight: '700',
    fontSize: 18,
  },
  textBlock: { flex: 1 },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
