import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const RunnerIcon = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="10" r="5" fill="#f59e0b" opacity="0.9"/>
    <path
      d="M30 18 L22 30 L14 28 M30 18 L34 30 L28 42 M22 30 L18 42"
      stroke="#f59e0b"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.85"
    />
    <path d="M14 28 L8 26" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const Signup = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [emailConf, setEmailConf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useTranslation("auth");

  const validatePassword = (pwd) => {
    if (pwd.length < 8)      return t("signup.passwordMinLength");
    if (!/[A-Z]/.test(pwd))  return t("signup.passwordUppercase");
    if (!/\d/.test(pwd))     return t("signup.passwordNumber");
    return null;
  };

  const handleSignup = async () => {
    if (!name || !email || !emailConf || !password) {
      setError(t("signup.fillAllFields"));
      return;
    }
    if (email !== emailConf) {
      setError(t("signup.emailMismatch"));
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    setLoading(true);
    setError("");

    const errorMsg = await signup(name, email, password);

    if (errorMsg) {
      setError(errorMsg.response?.data?.message || errorMsg.message || errorMsg || t("signup.error"));
      setLoading(false);
      return;
    }

    navigate("/home");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  const heroLines = t("signup.heroTitle").split("\n");

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <RunnerIcon />
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
            {t("signup.heroSubtitle")}
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>{t("signup.heroFooter")}</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.LangRow>
            <LanguageSwitcher />
          </C.LangRow>
          <C.AppBrand>{t("common:brand")}</C.AppBrand>
          <C.FormHeading>{t("signup.heading")}</C.FormHeading>
          <C.FormSub>{t("signup.subheading")}</C.FormSub>

          <C.FieldGroup>
            <Input
              type="text"
              placeholder={t("signup.namePlaceholder")}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={100}
            />
            <Input
              type="email"
              placeholder={t("signup.emailPlaceholder")}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="email"
              placeholder={t("signup.confirmEmailPlaceholder")}
              value={emailConf}
              onChange={(e) => { setEmailConf(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder={t("signup.passwordPlaceholder")}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <C.PasswordHint>{t("signup.passwordHint")}</C.PasswordHint>
          </C.FieldGroup>

          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? t("signup.submitLoading") : t("signup.submit")}
            onClick={handleSignup}
            disabled={loading}
          />

          <C.SigninLink>
            {t("signup.hasAccount")} <Link to="/">{t("signup.login")}</Link>
          </C.SigninLink>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default Signup;
