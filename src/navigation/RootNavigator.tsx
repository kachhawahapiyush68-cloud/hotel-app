// src/navigation/RootNavigator.tsx
import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

import CompanyListScreen from '../modules/masters/CompanyListScreen';
import CompanyEditScreen from '../modules/masters/CompanyEditScreen';
import CategoryListScreen from '../modules/masters/CategoryListScreen';
import RoomListScreen from '../modules/masters/RoomListScreen';
import ProductListScreen from '../modules/masters/ProductListScreen';
import GuestListScreen from '../modules/masters/GuestListScreen';
import UserListScreen from '../modules/users/UserListScreen';
import UserEditScreen from '../modules/users/UserEditScreen';

import { useThemeStore } from '../store/themeStore';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const { mode, theme } = useThemeStore();

  const baseNavTheme: NavTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            {/* <Stack.Screen name="LedgerList" component={LedgerListScreen} />
            <Stack.Screen
              name="TaxGroupList"
              component={TaxGroupListScreen}
            /> */}

            <Stack.Screen name="UserList" component={UserListScreen} />
            <Stack.Screen name="UserEdit" component={UserEditScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
