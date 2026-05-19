import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (email, password) => {
    try {
      setError(null);
      const userResponse = await authService.login(email, password);
      setUser(userResponse);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao fazer login";
      setError(errorMsg);
      return err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const userResponse = await authService.signup(name, email, password);
      setUser(userResponse);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao registrar";
      setError(errorMsg);
      return err;
    }
  };

  const signout = async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const reloadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      console.error("Erro ao recarregar usuário:", err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        loading,
        error,
        signin,
        signup,
        signout,
        updateUser,
        reloadUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
