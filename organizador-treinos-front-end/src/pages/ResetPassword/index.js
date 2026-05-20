import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

const ShieldIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26 4 L44 11 L44 26 C44 36 36 43 26 48 C16 43 8 36 8 26 L8 11 Z"
      stroke="#f59e0b"
      strokeWidth="2.5"
      fill="none"
      opacity="0.9"
    />
    <path
      d="M26 10 L38 15 L38 26 C38 33 33 38 26 42 C19 38 14 33 14 26 L14 15 Z"
      fill="#f59e0b"
      opacity="0.12"
    />
    <path
      d="M19 26 L24 31 L34 21"
      stroke="#f59e0b"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

const ResetPassword = () => {
  const [searchParams]                        = useSearchParams();
  const token                                 = searchParams.get("token") || "";
  const navigate                              = useNavigate();
  const { t } = useTranslation("auth");

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8)     return t("resetPassword.passwordMinLength");
    if (!/[A-Z]/.test(pwd)) return t("resetPassword.passwordUppercase");
    if (!/\d/.test(pwd))    return t("resetPassword.passwordNumber");
    return null;
  };

  const handleSubmit = async () => {
    if (!token) { setError(t("resetPassword.invalidLink")); return; }
    if (!newPassword || !confirmPassword) { setError(t("resetPassword.fillAllFields")); return; }
    if (newPassword !== confirmPassword)  { setError(t("resetPassword.passwordMismatch")); return; }

    const pwdError = validatePassword(newPassword);
    if (pwdError) { setError(pwdError); return; }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, newPassword);
      navigate("/signin", { state: { message: t("resetPassword.successMessage") } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("resetPassword.expiredLink"));
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const heroLines = t("resetPassword.heroTitle").split("\n");

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <ShieldIcon />
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
            {t("resetPassword.heroSubtitle")}
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>{t("resetPassword.heroFooter")}</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>{t("common:brand")}</C.AppBrand>
          <C.FormHeading>{t("resetPassword.heading")}</C.FormHeading>
          <C.FormSub>{t("resetPassword.subheading")}</C.FormSub>

          <C.FieldGroup>
            <Input
              type="password"
              placeholder={t("resetPassword.newPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder={t("resetPassword.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <C.PasswordHint>{t("resetPassword.passwordHint")}</C.PasswordHint>
          </C.FieldGroup>

          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? t("resetPassword.submitLoading") : t("resetPassword.submit")}
            onClick={handleSubmit}
            disabled={loading}
          />

          <C.BackLink>
            <Link to="/">{t("resetPassword.backToLogin")}</Link>
          </C.BackLink>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default ResetPassword;
