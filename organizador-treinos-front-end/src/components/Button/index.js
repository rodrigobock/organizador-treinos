import React from "react";
import * as C from "./styles";

const Button = ({ Text, onClick, Type = "button", disabled, size = "md", style }) => {
  return (
    <C.Button type={Type} onClick={onClick} disabled={disabled} $size={size} style={style}>
      {Text}
    </C.Button>
  );
};

export default Button;
