import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;

  login: (
    token: string,
    role: string,
    email: string
  ) => void;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  const [email, setEmail] = useState<string | null>(
    localStorage.getItem("email")
  );

  const login = (
    newToken: string,
    newRole: string,
    newEmail: string
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("email", newEmail);

    setToken(newToken);
    setRole(newRole);
    setEmail(newEmail);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        email,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};