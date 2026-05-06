import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Preencha o e-mail");
      return;
    }

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (success) {
    return (
      <C.Container>
        <C.Label>RECUPERAR SENHA</C.Label>
        <C.Content>
          <C.SuccessMessage>
            Se o e-mail estiver cadastrado, você receberá um link para redefinir
            sua senha. Verifique sua caixa de entrada.
          </C.SuccessMessage>
          <C.LabelLink>
            <C.Strong>
              <Link to="/">Voltar ao login</Link>
            </C.Strong>
          </C.LabelLink>
        </C.Content>
      </C.Container>
    );
  }

  return (
    <C.Container>
      <C.Label>RECUPERAR SENHA</C.Label>
      <C.Content>
        <C.Description>
          Informe seu e-mail para receber o link de redefinição de senha.
        </C.Description>
        <Input
          type="email"
          placeholder="Digite seu E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <C.labelError>{error}</C.labelError>
        <Button
          Text={loading ? "Enviando..." : "Enviar link"}
          onClick={handleSubmit}
          disabled={loading}
        />
        <C.LabelLink>
          Lembrou a senha?
          <C.Strong>
            <Link to="/">&nbsp;Faça login</Link>
          </C.Strong>
        </C.LabelLink>
      </C.Content>
    </C.Container>
  );
};

export default ForgotPassword;
