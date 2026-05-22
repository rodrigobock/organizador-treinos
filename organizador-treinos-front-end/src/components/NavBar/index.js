import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import LanguageSwitcher from "../LanguageSwitcher";
import * as S from "./styles";

function NavBar() {
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation("common");
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <S.NavbarContainer>
      <Container>
        <S.NavbarContent>
          {/* Left: Brand only */}
          <S.NavbarBrand to="/home">
            {t("brand")}
          </S.NavbarBrand>

          {/* Center: Nav links (hidden on mobile) */}
          <S.NavLinksCenter>
            <S.NavLink to="/home" $isActive={isActive("/home")}>{user?.role === 'PERSONAL_TRAINER' ? 'Dashboard' : t("navbar.dashboard")}</S.NavLink>
            <S.NavLink to="/myworkouts" $isActive={isActive("/myworkouts")}>{t("navbar.myWorkouts")}</S.NavLink>
            {user?.role === 'PERSONAL_TRAINER' && (
              <S.NavLink to="/shared-by-me" $isActive={isActive("/shared-by-me")}>{t("navbar.sharedByMe")}</S.NavLink>
            )}
            <S.NavLink to="/templates" $isActive={isActive("/templates")}>{t("navbar.templates")}</S.NavLink>
            <S.NavLink to="/account" $isActive={isActive("/account")}>{t("navbar.account")}</S.NavLink>
          </S.NavLinksCenter>

          {/* Right: Language + Theme toggle + user + logout */}
          <S.NavRightSection>
            <LanguageSwitcher />

            <S.ThemeToggle
              onClick={toggleTheme}
              title={theme === "dark" ? t("navbar.themeLight") : t("navbar.themeDark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </S.ThemeToggle>

            <S.UserAvatarWrapper>
              <S.UserAvatar>{initials}</S.UserAvatar>
            </S.UserAvatarWrapper>

            {firstName && (
              <S.UserName>{firstName}</S.UserName>
            )}

            <S.LogoutButton onClick={handleLogout}>
              {t("navbar.logout")}
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
              <S.MobileNavLink to="/home" $isActive={isActive("/home")}>{user?.role === 'PERSONAL_TRAINER' ? 'Dashboard' : t("navbar.dashboard")}</S.MobileNavLink>
              <S.MobileNavLink to="/myworkouts" $isActive={isActive("/myworkouts")}>{t("navbar.myWorkouts")}</S.MobileNavLink>
              {user?.role === 'PERSONAL_TRAINER' && (
                <S.MobileNavLink to="/shared-by-me" $isActive={isActive("/shared-by-me")}>{t("navbar.sharedByMe")}</S.MobileNavLink>
              )}
              <S.MobileNavLink to="/templates" $isActive={isActive("/templates")}>{t("navbar.templates")}</S.MobileNavLink>
              <S.MobileNavLink to="/account" $isActive={isActive("/account")}>{t("navbar.account")}</S.MobileNavLink>
              <S.MobileLogoutButton onClick={handleLogout}>
                {t("navbar.logout")}
              </S.MobileLogoutButton>
            </S.MobileNavContent>
          </S.MobileMenu>
        </S.NavbarContent>
      </Container>
    </S.NavbarContainer>
  );
}

export default NavBar;
