import React, { useState } from "react";
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

  const handleSubmit = async () => {
    if (!email) { setError("Preencha o e-mail"); return; }

    setLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch {
      setError("Erro ao enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <KeyIcon />
          <C.HeroTitle>
            RECUPERE<br />SUA<br />SENHA
          </C.HeroTitle>
          <C.HeroAccentBar />
          <C.HeroSubtitle>
            Sem problema. Enviaremos um link para você criar uma nova senha.
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>Organizador de Treinos</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>💪 Treinos</C.AppBrand>
          <C.FormHeading>Esqueceu a senha?</C.FormHeading>
          <C.FormSub>
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </C.FormSub>

          {success ? (
            <>
              <C.SuccessBox>
                Se o e-mail estiver cadastrado, você receberá um link para redefinir
                sua senha. Verifique sua caixa de entrada (e a pasta de spam).
              </C.SuccessBox>
              <C.BackLink>
                <Link to="/">Voltar ao login</Link>
              </C.BackLink>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />

              {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

              <Button
                Text={loading ? "Enviando..." : "Enviar link"}
                onClick={handleSubmit}
                disabled={loading}
              />

              <C.BackLink>
                Lembrou a senha? <Link to="/">Faça login</Link>
              </C.BackLink>
            </>
          )}
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default ForgotPassword;
