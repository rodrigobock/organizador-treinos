import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Spinner from "react-bootstrap/Spinner";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

const KeyIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="13" stroke="#f59e0b" strokeWidth="3" opacity="0.9"/>
    <circle cx="20" cy="20" r="6" fill="#f59e0b" opacity="0.35"/>
    <path d="M29 29 L46 46" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
    <path d="M38 40 L42 36" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M34 44 L38 40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("auth");

  const handleSubmit = async () => {
    if (!email) { setError(t("forgotPassword.fillEmail")); return; }

    setLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("forgotPassword.errorSending"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const heroLines = t("forgotPassword.heroTitle").split("\n");

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <KeyIcon />
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
            {t("forgotPassword.heroSubtitle")}
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>{t("forgotPassword.heroFooter")}</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>{t("common:brand")}</C.AppBrand>
          <C.FormHeading>{t("forgotPassword.heading")}</C.FormHeading>
          <C.FormSub>
            {t("forgotPassword.subheading")}
          </C.FormSub>

          {success ? (
            <>
              <C.SuccessBox>
                {t("forgotPassword.successMessage")}
              </C.SuccessBox>
              <C.BackLink>
                <Link to="/">{t("forgotPassword.backToLogin")}</Link>
              </C.BackLink>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />

              {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

              <Button
                Text={
                  loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                      {t("forgotPassword.submitLoading")}
                    </span>
                  ) : t("forgotPassword.submit")
                }
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
              />

              <C.BackLink>
                {t("forgotPassword.rememberPassword")} <Link to="/">{t("forgotPassword.doLogin")}</Link>
              </C.BackLink>
            </>
          )}
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default ForgotPassword;
