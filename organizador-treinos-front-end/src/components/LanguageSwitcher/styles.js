import styled from "styled-components";

export const Container = styled.div`
  display: inline-flex;
  align-items: stretch;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  overflow: hidden;
`;

export const Option = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  font-size: 12px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  background-color: ${(props) =>
    props.$active ? "var(--nav-active-bg)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--accent)" : "var(--text-muted)"};

  &:hover {
    background-color: var(--nav-active-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;
