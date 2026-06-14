import { createContext, useContext, useState, useEffect } from "react";
import userAPI from "../api/users";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const currentUser = await userAPI.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.debug("User not authenticated:", err.message);
          setUser(null);
          setError(null);
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username, password) => {
    setAuthLoading(true);
    try {
      await userAPI.login(username, password);
      const currentUser = await userAPI.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (username, password) => {
    setAuthLoading(true);
    try {
      await userAPI.register(username, password);
      await userAPI.login(username, password);
      const currentUser = await userAPI.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await userAPI.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        initializing,
        authLoading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
