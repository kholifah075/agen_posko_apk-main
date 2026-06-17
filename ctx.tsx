import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useStorageState } from "./useStorageState";

export type PoskoUser = {
  id?: number;
  username?: string | null;
  password?: string | null;
  is_admin?: boolean | null;
  created_at?: string | null;
  role?: string | null;
  [key: string]: any;
};

type AuthContextType = {
  signIn: (userData: PoskoUser) => void;
  signOut: () => void;
  session?: string | null;
  user?: PoskoUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useSession() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useSession must be wrapped in a SessionProvider");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const user = useMemo(() => {
    if (!session) return null;

    try {
      return JSON.parse(session) as PoskoUser;
    } catch (error) {
      console.log("Session parse error:", error);
      return null;
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        signIn: (userData: PoskoUser) => {
          setSession(JSON.stringify(userData));
        },
        signOut: () => {
          setSession(null);
        },
        session,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
