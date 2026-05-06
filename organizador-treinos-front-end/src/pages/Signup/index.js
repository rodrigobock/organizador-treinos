import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

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

  const validatePassword = (pwd) => {
    if (pwd.length < 8)      return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd))  return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/\d/.test(pwd))     return "Senha deve conter pelo menos um número";
    return null;
  };

  const handleSignup = async () => {
    if (!name || !email || !emailConf || !password) {
      setError("Preencha todos os campos");
      return;
    }
    if (email !== emailConf) {
      setError("Os e-mails não são iguais");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    setLoading(true);
    setError("");

    const errorMsg = await signup(name, email, password);

    if (errorMsg) {
      setError(errorMsg);
      setLoading(false);
      return;
    }

    navigate("/home");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <C.PageWrapper>
      <C.HeroPanel>
        <C.DecorRing />
        <C.DecorRing />

        <C.HeroContent>
          <RunnerIcon />
          <C.HeroTitle>
            COMECE<br />SUA<br />JORNADA
          </C.HeroTitle>
          <C.HeroAccentBar />
          <C.HeroSubtitle>
            Crie sua conta e comece a organizar seus treinos hoje mesmo.
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>Organizador de Treinos</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>💪 Treinos</C.AppBrand>
          <C.FormHeading>Criar conta</C.FormHeading>
          <C.FormSub>Preencha os dados abaixo para começar</C.FormSub>

          <C.FieldGroup>
            <Input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="email"
              placeholder="Confirmar e-mail"
              value={emailConf}
              onChange={(e) => { setEmailConf(e.target.value); setError(""); }}
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
            <C.PasswordHint>Mínimo 8 caracteres, 1 maiúscula e 1 número</C.PasswordHint>
          </C.FieldGroup>

          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? "Criando conta..." : "Criar conta"}
            onClick={handleSignup}
            disabled={loading}
          />

          <C.SigninLink>
            Já tem conta? <Link to="/">Entrar</Link>
          </C.SigninLink>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default Signup;
