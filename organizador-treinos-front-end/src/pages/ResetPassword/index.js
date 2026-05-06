import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/\d/.test(pwd)) return "Senha deve conter pelo menos um número";
    return null;
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("Link inválido. Solicite um novo.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não são iguais");
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <C.Container>
      <C.Label>REDEFINIR SENHA</C.Label>
      <C.Content>
        <Input
          type="password"
          placeholder="Nova senha (min 8 caracteres, 1 maiúscula, 1 número)"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Confirme a nova senha"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <C.labelError>{error}</C.labelError>
        <Button
          Text={loading ? "Salvando..." : "Redefinir senha"}
          onClick={handleSubmit}
          disabled={loading}
        />
        <C.LabelLink>
          <C.Strong>
            <Link to="/">Voltar ao login</Link>
          </C.Strong>
        </C.LabelLink>
      </C.Content>
    </C.Container>
  );
};

export default ResetPassword;
