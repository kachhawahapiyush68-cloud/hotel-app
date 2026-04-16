// src/modules/masters/MastersScreen.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useThemeStore } from "../../store/themeStore";

// ── Types ─────────────────────────────────────────────────────

type ItemProps = {
  icon:      string;
  title:     string;
  subtitle:  string;
  onPress:   () => void;
  disabled?: boolean;   // ← NEW: renders as non-interactive tile
};

// ── MasterItem ────────────────────────────────────────────────

const MasterItem: React.FC<ItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
}) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          borderColor:      colors.border,
          backgroundColor:  colors.surface,
        },
        // Dim the whole tile when disabled
        disabled && { opacity: 0.45 },
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.85}
      // Prevent touch events from registering at all
      disabled={disabled}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.itemSubtitle, { color: colors.textSecondary }]}
        >
          {subtitle}
        </Text>

        {/* "Coming soon" badge when disabled */}
        {disabled && (
          <Text style={[styles.comingSoon, { color: colors.primary }]}>
            Coming soon
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── MastersScreen ─────────────────────────────────────────────

export default function MastersScreen() {
  const navigation = useNavigation<any>();
  const { theme }  = useThemeStore();
  const colors     = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        Masters
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Configuration & master data
      </Text>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <MasterItem
          icon="business-outline"
          title="Companies"
          subtitle="Manage hotel/company profiles"
          onPress={() => navigation.navigate("CompanyList")}
        />

        <MasterItem
          icon="albums-outline"
          title="Categories"
          subtitle="Room, POS and other groups"
          onPress={() => navigation.navigate("CategoryList")}
        />

        <MasterItem
          icon="bed-outline"
          title="Rooms"
          subtitle="Room types, numbers and status"
          onPress={() => navigation.navigate("RoomList")}
        />

        <MasterItem
          icon="pricetag-outline"
          title="Products"
          subtitle="Extra services and items"
          onPress={() => navigation.navigate("ProductList")}
        />

        <MasterItem
          icon="person-outline"
          title="Guests"
          subtitle="Guest profiles and contacts"
          onPress={() => navigation.navigate("GuestList")}
        />

        <MasterItem
          icon="book-outline"
          title="Ledgers"
          subtitle="Accounts and balances"
          onPress={() => navigation.navigate("LedgerList")}
        />

        {/* ── Tax Groups — screen not built yet, disabled ──── */}
        <MasterItem
          icon="receipt-outline"
          title="Tax Groups"
          subtitle="Tax configuration"
          onPress={() => {}}
          disabled
        />

        <MasterItem
          icon="cash-outline"
          title="Vouchers"
          subtitle="Receipt, payment and journal entries"
          onPress={() => navigation.navigate("VoucherList")}
        />

        <MasterItem
          icon="people-outline"
          title="Users"
          subtitle="Admin & employee accounts"
          onPress={() => navigation.navigate("UserList")}
        />

        {/* ── Daily Register ──────────────────────────────── */}
        <MasterItem
          icon="document-text-outline"
          title="Daily Register"
          subtitle="Room collection & cash summary"
          onPress={() => navigation.navigate("DailyRegister")}
        />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const { width }   = Dimensions.get("window");
const ITEM_MARGIN = 8;
const ITEM_WIDTH  = (width - 16 * 2 - ITEM_MARGIN * 2) / 2;

const styles = StyleSheet.create({
  container: {
    flex:              1,
    paddingHorizontal: 16,
    paddingTop:        16,
  },
  header: {
    fontSize:     24,
    fontWeight:   "600",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize:     14,
    fontWeight:   "500",
    marginBottom: 16,
  },
  gridContainer: {
    paddingBottom:  24,
    flexDirection:  "row",
    flexWrap:       "wrap",
    justifyContent: "space-between",
  },
  item: {
    width:             ITEM_WIDTH,
    flexDirection:     "row",
    alignItems:        "center",
    borderRadius:      16,
    paddingVertical:   14,
    paddingHorizontal: 12,
    marginBottom:      12,
    borderWidth:       1,
  },
  iconCircle: {
    width:           40,
    height:          40,
    borderRadius:    20,
    alignItems:      "center",
    justifyContent:  "center",
    marginRight:     10,
  },
  textBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize:   14,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize:  12,
    marginTop: 2,
  },
  comingSoon: {
    fontSize:   10,
    fontWeight: "600",
    marginTop:  4,
    letterSpacing: 0.3,
  },
});
