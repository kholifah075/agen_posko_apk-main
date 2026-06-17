import { createContext, use, type PropsWithChildren } from 'react';

import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');

    return (
        <AuthContext.Provider
            value={{
                signIn: () => {
                    setSession('xxx');
                },
                signOut: () => {
                    setSession(null);
                },
                session,
                isLoading,
            }}>
        {children}
        </AuthContext.Provider>
    );
}export type PoskoUser = {
  id?: number;
  username?: string | null;
  password?: string | null;
  is_admin?: boolean | null;
  created_at?: string | null;
  role?: string | null;
  [key: string]: any;
};mport { createContext, use, type PropsWithChildren } from 'react';

import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');

    return (
        <AuthContext.Provider
            value={{
                signIn: () => {
                    setSession('xxx');
                },
                signOut: () => {
                    setSession(null);
                },
                session,
                isLoading,
            }}>
        {children}
        </AuthContext.Provider>
    );
}
