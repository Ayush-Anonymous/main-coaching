import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api, { User } from "@/lib/api";

type AppRole = "admin" | "director" | "faculty" | "student";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();

      if (token) {
        const result = await api.getMe();
        if (result.data?.user) {
          setUser(result.data.user);
          setRoles((result.data.user.roles || []) as AppRole[]);
        } else {
          // Token invalid, clear it
          api.setToken(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const result = await api.register(email, password, fullName);

    if (result.error) {
      return { error: new Error(result.error) };
    }

    if (result.data?.user) {
      setUser(result.data.user);
      setRoles((result.data.user.roles || ['student']) as AppRole[]);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const result = await api.login(email, password);

    if (result.error) {
      return { error: new Error(result.error) };
    }

    if (result.data?.user) {
      setUser(result.data.user);
      setRoles((result.data.user.roles || []) as AppRole[]);
    }

    return { error: null };
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
    setRoles([]);
  };

  const isStaff = roles.some((r) => ["admin", "director", "faculty"].includes(r));
  const isAdmin = roles.includes("admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roles,
        isStaff,
        isAdmin,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
