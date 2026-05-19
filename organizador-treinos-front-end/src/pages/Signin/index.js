import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const BarbellIcon = () => (
  <svg width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0"   y="10" width="18" height="40" rx="4" fill="#f59e0b" opacity="0.95"/>
    <rect x="20"  y="18" width="12" height="24" rx="3" fill="#f59e0b" opacity="0.7"/>
    <rect x="34"  y="23" width="7"  height="14" rx="2" fill="#f59e0b" opacity="0.45"/>
    <rect x="41"  y="26" width="138" height="8" rx="4" fill="#94a3b8" opacity="0.7"/>
    <rect x="179" y="23" width="7"  height="14" rx="2" fill="#f59e0b" opacity="0.45"/>
    <rect x="188" y="18" width="12" height="24" rx="3" fill="#f59e0b" opacity="0.7"/>
    <rect x="202" y="10" width="18" height="40" rx="4" fill="#f59e0b" opacity="0.95"/>
  </svg>
);

const Signin = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("signin.fillAllFields"));
      return;
    }

    setLoading(true);
    setError("");

    const errorMsg = await signin(email, password);

    if (errorMsg) {
      setError(errorMsg);
      setLoading(false);
      return;
    }

    navigate("/home");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const heroLines = t("signin.heroTitle").split("\n");

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <BarbellIcon />
          <C.HeroTitle>
            {heroLines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </C.HeroTitle>
          <C.HeroAccentBar />
          <C.HeroSubtitle>
            {t("signin.heroSubtitle")}
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>{t("signin.heroFooter")}</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.LangRow>
            <LanguageSwitcher />
          </C.LangRow>
          <C.AppBrand>{t("common:brand")}</C.AppBrand>
          <C.FormHeading>{t("signin.heading")}</C.FormHeading>
          <C.FormSub>{t("signin.subheading")}</C.FormSub>

          <C.FieldGroup>
            <Input
              type="email"
              placeholder={t("signin.emailPlaceholder")}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder={t("signin.passwordPlaceholder")}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </C.FieldGroup>

          {success && <C.SuccessMsg>{success}</C.SuccessMsg>}
          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? t("signin.submitLoading") : t("signin.submit")}
            onClick={handleLogin}
            disabled={loading}
          />

          <C.FooterLinks>
            <C.ForgotLink>
              <Link to="/forgot-password">{t("signin.forgotPassword")}</Link>
            </C.ForgotLink>
            <C.SignupLink>
              {t("signin.noAccount")} <Link to="/signup">{t("signin.register")}</Link>
            </C.SignupLink>
          </C.FooterLinks>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default Signin;
