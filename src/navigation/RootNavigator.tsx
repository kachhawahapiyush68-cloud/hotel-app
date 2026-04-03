import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme as NavTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

import CompanyListScreen from "../modules/masters/CompanyListScreen";
import CompanyEditScreen from "../modules/masters/CompanyEditScreen";
import CategoryListScreen from "../modules/masters/CategoryListScreen";
import RoomListScreen from "../modules/masters/RoomListScreen";
import ProductListScreen from "../modules/masters/ProductListScreen";
import GuestListScreen from "../modules/masters/GuestListScreen";

import UserListScreen from "../modules/users/UserListScreen";
import UserEditScreen from "../modules/users/UserEditScreen";

import BookingListScreen from "../modules/booking/BookingListScreen";
import QuickReservationScreen from "../modules/booking/QuickReservationScreen";
import ArrivalListScreen from "../modules/booking/ArrivalListScreen";

import StayViewScreen from "../modules/stayView/StayViewScreen";
import AddChargeScreen from "../modules/stayView/AddChargeScreen";

import KotListScreen from "../modules/kot/KotListScreen";
import KotEntryScreen from "../modules/kot/KotEntryScreen";

import BillListScreen from "../modules/bill/BillListScreen";
import BillDetailScreen from "../modules/bill/BillDetailScreen";
import BillFromKotScreen from "../modules/bill/BillFromKotScreen";

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;

  CompanyList: undefined;
  CompanyEdit: { id?: number } | undefined;

  CategoryList: undefined;
  RoomList: undefined;
  ProductList: undefined;
  GuestList: undefined;
  LedgerList: undefined;
  TaxGroupList: undefined;

  UserList: undefined;
  UserEdit: { id: number };

  BookingList: undefined;
  QuickReservation: { bookingId?: number } | undefined;
  ArrivalList: undefined;

  StayView: undefined;
  AddCharge: {
    bookingId: number;
    folioId: number;
    roomId: number;
  };

  KOTList: undefined;
  KotEntry:
    | {
        kotId?: number;
        booking_id?: number;
        room_id?: number;
        table_no?: string;
        service_type?: "TABLE" | "ROOM";
      }
    | undefined;

  BillList: undefined;
  BillDetail: { billId: number };
  BillFromKot:
    | {
        kotIds?: number[];
        bookingId?: number;
        guestId?: number;
        folioId?: number;
        roomId?: number;
      }
    | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { mode, theme } = useThemeStore();

  const baseNavTheme: NavTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  const navTheme: NavTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {!user ? (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />

            <Stack.Screen name="CompanyList" component={CompanyListScreen} />
            <Stack.Screen name="CompanyEdit" component={CompanyEditScreen} />
            <Stack.Screen name="CategoryList" component={CategoryListScreen} />
            <Stack.Screen name="RoomList" component={RoomListScreen} />
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="GuestList" component={GuestListScreen} />

            <Stack.Screen name="UserList" component={UserListScreen} />
            <Stack.Screen name="UserEdit" component={UserEditScreen} />

            <Stack.Screen name="BookingList" component={BookingListScreen} />
            <Stack.Screen
              name="QuickReservation"
              component={QuickReservationScreen}
            />
            <Stack.Screen name="ArrivalList" component={ArrivalListScreen} />

            <Stack.Screen name="StayView" component={StayViewScreen} />
            <Stack.Screen name="AddCharge" component={AddChargeScreen} />

            <Stack.Screen name="KOTList" component={KotListScreen} />
            <Stack.Screen name="KotEntry" component={KotEntryScreen} />

            <Stack.Screen name="BillList" component={BillListScreen} />
            <Stack.Screen name="BillDetail" component={BillDetailScreen} />
            <Stack.Screen name="BillFromKot" component={BillFromKotScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;