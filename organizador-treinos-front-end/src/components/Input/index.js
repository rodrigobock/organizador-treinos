import React, { useState } from "react";
import * as C from "./styles";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Input = ({ type, placeholder, value, onChange, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);

  if (type === "password") {
    return (
      <C.Wrapper>
        <C.Input
          value={value}
          onChange={onChange}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...rest}
        />
        <C.ToggleButton
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </C.ToggleButton>
      </C.Wrapper>
    );
  }

  return (
    <C.Input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default Input;
