import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

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

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha todos os campos");
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

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <BarbellIcon />
          <C.HeroTitle>
            TREINE<br />COM<br />FOCO
          </C.HeroTitle>
          <C.HeroAccentBar />
          <C.HeroSubtitle>
            Organize seus treinos, acompanhe seu progresso e supere seus limites.
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>Organizador de Treinos</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>💪 Treinos</C.AppBrand>
          <C.FormHeading>Bem-vindo de volta</C.FormHeading>
          <C.FormSub>Entre com seu e-mail e senha</C.FormSub>

          <C.FieldGroup>
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </C.FieldGroup>

          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? "Entrando..." : "Entrar"}
            onClick={handleLogin}
            disabled={loading}
          />

          <C.FooterLinks>
            <C.ForgotLink>
              <Link to="/forgot-password">Esqueceu a senha?</Link>
            </C.ForgotLink>
            <C.SignupLink>
              Não tem conta? <Link to="/signup">Registre-se</Link>
            </C.SignupLink>
          </C.FooterLinks>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default Signin;
