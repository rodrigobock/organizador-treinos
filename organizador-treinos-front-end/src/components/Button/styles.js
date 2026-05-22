import styled from "styled-components";

export const Button = styled.button`
  border: none;
  cursor: pointer;
  background: var(--btn-primary-bg, linear-gradient(135deg, #046ee5, #0284c7));
  color: var(--btn-primary-text, #ffffff);
  font-weight: 600;
  border-radius: 6px;
  font-family: "Outfit", -apple-system, sans-serif;
  transition: opacity 0.15s, transform 0.1s;

  ${(p) => {
    if (p.$size === "sm") return `
    padding: 7px 14px;
    font-size: 13px;
    width: auto;
    max-width: none;
  `;
    if (p.$size === "lg") return `
    padding: 16px 20px;
    font-size: 16px;
    width: 100%;
    max-width: 350px;
  `;
    return `
    padding: 10px 20px;
    font-size: 14px;
    width: auto;
    max-width: none;
  `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.85;
  }

  &:not(:disabled):active {
    transform: scale(0.97);
  }
`;
