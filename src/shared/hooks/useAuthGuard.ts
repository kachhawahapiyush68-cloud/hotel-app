// src/shared/hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { normalizeRole } from '../utils/role';

export type GuardRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | string;

type RootParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
};

export function useAuthGuard(allowedRoles?: GuardRole[]) {
  const navigation = useNavigation<NavigationProp<RootParamList>>();
  const { user, token, logout } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
      return;
    }

    if (!allowedRoles || allowedRoles.length === 0) {
      return;
    }

    const currentRole = normalizeRole(user.role);
    const allowed = allowedRoles
      .map(r => normalizeRole(r))
      .includes(currentRole);

    if (!allowed) {
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    }
  }, [token, user, allowedRoles, navigation, logout]);
}
