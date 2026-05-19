import React from "react";
import { useLanguage } from "../../contexts/language";
import * as S from "./styles";

const LANGUAGES = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLang = language || "pt-BR";
  const normalizedLang = currentLang.startsWith("pt") ? "pt-BR" : "en";

  return (
    <S.Container role="radiogroup" aria-label="Language">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = normalizedLang === code;
        return (
          <S.Option
            key={code}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            $active={isActive}
            onClick={() => {
              if (!isActive && setLanguage) setLanguage(code);
            }}
            tabIndex={isActive ? 0 : -1}
          >
            {label}
          </S.Option>
        );
      })}
    </S.Container>
  );
}

export default LanguageSwitcher;
