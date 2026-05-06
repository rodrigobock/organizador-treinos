import React, { useState } from "react";
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

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8)     return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/\d/.test(pwd))    return "Senha deve conter pelo menos um número";
    return null;
  };

  const handleSubmit = async () => {
    if (!token) { setError("Link inválido. Solicite um novo."); return; }
    if (!newPassword || !confirmPassword) { setError("Preencha todos os campos"); return; }
    if (newPassword !== confirmPassword)  { setError("As senhas não são iguais"); return; }

    const pwdError = validatePassword(newPassword);
    if (pwdError) { setError(pwdError); return; }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, newPassword);
      navigate("/", { state: { message: "Senha redefinida com sucesso! Faça login." } });
    } catch {
      setError("Link inválido ou expirado. Solicite um novo.");
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
          <ShieldIcon />
          <C.HeroTitle>
            NOVA<br />SENHA<br />SEGURA
          </C.HeroTitle>
          <C.HeroAccentBar />
          <C.HeroSubtitle>
            Escolha uma senha forte para manter sua conta protegida.
          </C.HeroSubtitle>
        </C.HeroContent>

        <C.HeroFooter>Organizador de Treinos</C.HeroFooter>
      </C.HeroPanel>

      <C.FormPanel>
        <C.FormCard>
          <C.AppBrand>💪 Treinos</C.AppBrand>
          <C.FormHeading>Redefinir senha</C.FormHeading>
          <C.FormSub>Crie uma nova senha para sua conta</C.FormSub>

          <C.FieldGroup>
            <Input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <C.PasswordHint>Mínimo 8 caracteres, 1 maiúscula e 1 número</C.PasswordHint>
          </C.FieldGroup>

          {error && <C.ErrorMsg>{error}</C.ErrorMsg>}

          <Button
            Text={loading ? "Salvando..." : "Redefinir senha"}
            onClick={handleSubmit}
            disabled={loading}
          />

          <C.BackLink>
            <Link to="/">Voltar ao login</Link>
          </C.BackLink>
        </C.FormCard>
      </C.FormPanel>
    </C.PageWrapper>
  );
};

export default ResetPassword;
