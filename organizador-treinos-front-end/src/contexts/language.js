import { createContext, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const LanguageContext = createContext({});

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { signed } = useAuth();

  const language = i18n.language || "pt-BR";

  const setLanguage = useCallback(
    async (lang) => {
      await i18n.changeLanguage(lang);
      document.documentElement.lang = lang;

      if (signed) {
        try {
          await api.put("/users/me", { preferredLocale: lang });
        } catch (err) {
          // Silently fail — locale preference is best-effort
          console.error("Failed to persist locale preference:", err);
        }
      }
    },
    [i18n, signed]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
