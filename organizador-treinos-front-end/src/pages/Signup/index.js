import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as C from "./styles";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConf, setEmailConf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { signup } = useAuth();

  const validatePassword = (pwd) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasLength = pwd.length >= 8;

    if (!hasLength) {
      return "Senha deve ter no mínimo 8 caracteres";
    }
    if (!hasUppercase) {
      return "Senha deve conter pelo menos uma letra maiúscula";
    }
    if (!hasNumber) {
      return "Senha deve conter pelo menos um número";
    }
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
    if (passwordError) {
      setError(passwordError);
      return;
    }

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <C.Container>
      <C.Label>CRIAR CONTA</C.Label>
      <C.Content>
        <Input
          type="text"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
        <Input
          type="email"
          placeholder="Digite seu E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
        <Input
          type="email"
          placeholder="Confirme seu E-mail"
          value={emailConf}
          onChange={(e) => {
            setEmailConf(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Digite sua Senha (min 8 caracteres, 1 maiúscula, 1 número)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <C.labelError>{error}</C.labelError>
        <Button
          Text={loading ? "Criando conta..." : "Inscrever-se"}
          onClick={handleSignup}
          disabled={loading}
        />
        <C.LabelSignin>
          Já tem uma conta?
          <C.Strong>
            <Link to="/">&nbsp;Entre</Link>
          </C.Strong>
        </C.LabelSignin>
      </C.Content>
    </C.Container>
  );
};

export default Signup;
