'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from 'react';

import { queryKeys } from '@/constants/queryKeys';
import { HOME_ROUTE } from '@/constants/routes';
import { useLogin, useLogout } from '@/hooks/api/useAuthApi';
import { useMe } from '@/hooks/api/useUsersApi';
import { TUser } from '@/types/user';
import { session } from '@/utils/session';
import { LoginForm } from '@/validation/login.validation';

type ContextValues = {
  user: TUser | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<ContextValues>({
  user: null,
  isLoading: false,
  isLoggingIn: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  fetchUser: () => Promise.resolve(),
});

const subscribeNoop = () => () => {};

const getRedirectPath = (): Route => {
  const redirect = new URLSearchParams(window.location.search).get('redirect');

  if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
    return redirect as Route;
  }

  return HOME_ROUTE;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sessionFlag, setSessionFlag] = useState(0);

  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const hasSession =
    isHydrated && (sessionFlag >= 0 ? session.hasSession() : false);

  const { data: user, isLoading, refetch } = useMe(hasSession);
  const { mutateAsync: loginService, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logoutService } = useLogout();

  const fetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const logout = useCallback(async () => {
    const refreshToken = session.getRefreshToken();

    if (refreshToken) {
      await logoutService(refreshToken).catch(() => undefined);
    }

    queryClient.clear();
    session.end();
  }, [logoutService, queryClient]);

  const login = useCallback(
    async (form: LoginForm) => {
      const { user: loggedUser, ...tokens } = await loginService(form);
      session.start(tokens, form.requestRefresh);
      queryClient.setQueryData(queryKeys.user.me, loggedUser);
      setSessionFlag(prev => prev + 1);
      router.replace(getRedirectPath());
    },
    [loginService, queryClient, router],
  );

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: hasSession && isLoading,
        isLoggingIn,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
