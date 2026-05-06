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
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      setUser(response.user);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao fazer login";
      setError(errorMsg);
      return errorMsg;
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const response = await authService.signup(name, email, password);
      authService.setToken(response.token);
      setUser(response.user);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao registrar";
      setError(errorMsg);
      return errorMsg;
    }
  };

  const signout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
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
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
