import styled from "styled-components";

export const Input = styled.input`
  outline: none;
  padding: 14px 16px;
  width: 100%;
  border-radius: 6px;
  font-size: 15px;
  font-family: "Outfit", -apple-system, sans-serif;
  background-color: var(--bg-surface, #f0f2f5);
  border: 1px solid var(--border, #e2e8f0);
  color: var(--text-primary, #0f172a);
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: var(--text-muted, #94a3b8);
  }

  &:focus {
    border-color: var(--accent, #6366f1);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 15%, transparent);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
