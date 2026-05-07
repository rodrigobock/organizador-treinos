import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";
import userService from "../../services/userService";

function AccountPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("O nome não pode estar vazio");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await authService.updateUser(name.trim());
      updateUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setError("");
    setSuccess(false);
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/\d/.test(pwd)) return "Senha deve conter pelo menos um número";
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Preencha todos os campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As novas senhas não são iguais");
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      await userService.changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || "Erro ao mudar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
  };

  return (
    <>
      <NavBar />
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          backgroundColor: "var(--bg-primary)",
          padding: "32px 16px",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Minha Conta
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              Gerencie seus dados
            </p>
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                    setSuccess(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-muted)",
                    fontSize: 14,
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }}
                />
              </div>

              {error && (
                <p style={{ color: "var(--accent-alt)", fontSize: 13, marginBottom: 12 }}>
                  {error}
                </p>
              )}
              {success && (
                <p style={{ color: "var(--success)", fontSize: 13, marginBottom: 12 }}>
                  Dados atualizados com sucesso!
                </p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--btn-primary-bg)",
                    color: "var(--btn-primary-text)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
                marginTop: 0,
              }}
            >
              Trocar Senha
            </h2>

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                  disabled={changingPassword}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                  disabled={changingPassword}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                  disabled={changingPassword}
                />
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  margin: "12px 0 16px",
                }}
              >
                Mínimo 8 caracteres, 1 maiúscula e 1 número
              </p>

              {passwordError && (
                <p style={{ color: "var(--accent-alt)", fontSize: 13, marginBottom: 12 }}>
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p style={{ color: "var(--success)", fontSize: 13, marginBottom: 12 }}>
                  Senha alterada com sucesso!
                </p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--btn-primary-bg)",
                    color: "var(--btn-primary-text)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    opacity: changingPassword ? 0.7 : 1,
                  }}
                >
                  {changingPassword ? "Salvando..." : "Salvar Nova Senha"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  disabled={changingPassword}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
