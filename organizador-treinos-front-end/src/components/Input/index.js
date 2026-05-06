import React from "react";
import * as C from "./styles";

const Input = ({ type, placeholder, value, onChange, ...rest }) => {
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
