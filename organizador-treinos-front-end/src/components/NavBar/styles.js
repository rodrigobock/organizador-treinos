import styled from "styled-components";

export const NavbarContainer = styled.nav`
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 0;
`;

export const NavbarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  position: relative;

  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;

export const NavbarBrand = styled.a`
  color: var(--text-primary);
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: var(--text-primary);
    text-decoration: none;
  }

  @media (max-width: 991px) {
    flex: 1;
  }
`;

export const NavLinksCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  justify-content: center;

  @media (max-width: 991px) {
    display: none;
  }
`;

export const NavLink = styled.a`
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: var(--text-primary);
    text-decoration: none;
  }
`;

export const NavRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;

  @media (max-width: 991px) {
    gap: 8px;
    order: 3;
    margin-left: auto;
    margin-right: 8px;
  }
`;

export const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--nav-active-bg);
  }
`;

export const UserAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--nav-active-bg);
  color: var(--accent);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;

export const UserName = styled.span`
  color: var(--text-muted);
  font-size: 13px;
`;

export const LogoutButton = styled.button`
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: var(--nav-active-bg);
    border-color: var(--accent);
    color: var(--text-primary);
  }
`;

export const MobileMenu = styled.div`
  display: none;
  position: relative;

  @media (max-width: 991px) {
    display: flex;
    align-items: center;
    gap: 8px;
    order: 4;
  }
`;

export const MobileMenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--nav-active-bg);
    border-radius: 6px;
  }
`;

export const MobileNavContent = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  min-width: 160px;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: 0;
  margin-top: 8px;
  z-index: 1000;

  @media (max-width: 991px) {
    position: absolute;
    top: 100%;
    right: 0;
  }
`;

export const MobileNavLink = styled.a`
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
  padding: 10px 16px;
  transition: all 0.15s;
  display: block;

  &:hover {
    color: var(--text-primary);
    background-color: var(--nav-active-bg);
    text-decoration: none;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }
`;

export const MobileLogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  padding: 10px 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  border-radius: 0 0 6px 6px;

  &:hover {
    color: var(--text-primary);
    background-color: var(--nav-active-bg);
  }
`;
