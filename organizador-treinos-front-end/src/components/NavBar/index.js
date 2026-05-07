import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import * as S from "./styles";

function NavBar() {
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location]);

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <S.NavbarContainer>
      <Container>
        <S.NavbarContent>
          {/* Left: Brand only */}
          <S.NavbarBrand href="/home">
            💪 Treinos
          </S.NavbarBrand>

          {/* Center: Nav links (hidden on mobile) */}
          <S.NavLinksCenter>
            <S.NavLink href="/home">Dashboard</S.NavLink>
            <S.NavLink href="/myworkouts">Meus Treinos</S.NavLink>
            <S.NavLink href="/account">Conta</S.NavLink>
          </S.NavLinksCenter>

          {/* Right: Theme toggle + user + logout */}
          <S.NavRightSection>
            <S.ThemeToggle
              onClick={toggleTheme}
              title={theme === "dark" ? "Mudar para Light" : "Mudar para Dark"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </S.ThemeToggle>

            <S.UserAvatar>{initials}</S.UserAvatar>

            {firstName && (
              <S.UserName>{firstName}</S.UserName>
            )}

            <S.LogoutButton onClick={handleLogout}>
              Sair
            </S.LogoutButton>
          </S.NavRightSection>

          {/* Mobile hamburger */}
          <S.MobileMenu>
            <S.MobileMenuButton
              type="button"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </S.MobileMenuButton>

            <S.MobileNavContent isOpen={mobileMenuOpen}>
              <S.MobileNavLink href="/home">Dashboard</S.MobileNavLink>
              <S.MobileNavLink href="/myworkouts">Meus Treinos</S.MobileNavLink>
              <S.MobileNavLink href="/account">Conta</S.MobileNavLink>
              <S.MobileLogoutButton onClick={handleLogout}>
                Sair
              </S.MobileLogoutButton>
            </S.MobileNavContent>
          </S.MobileMenu>
        </S.NavbarContent>
      </Container>
    </S.NavbarContainer>
  );
}

export default NavBar;
