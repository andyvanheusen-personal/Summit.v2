import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

const STORAGE_KEY = 'summit-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true',
  );

  const login = useCallback((username: string, password: string) => {
    if (username.trim().toLowerCase() === 'demo' && password === 'password') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
