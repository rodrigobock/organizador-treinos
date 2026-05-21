import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";
import userService from "../../services/userService";
import trainerService from "../../services/trainerService";

function AccountPage() {
  const { user, updateUser, signout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("account");
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [studentSuccess, setStudentSuccess] = useState("");

  const EyeIcon = ({ visible, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  React.useEffect(() => {
    if (user?.role !== 'PERSONAL_TRAINER') return;
    const load = async () => {
      setStudentsLoading(true);
      try {
        const data = await trainerService.getStudents();
        setStudents(data);
      } catch (err) {
        // silently fail
      } finally {
        setStudentsLoading(false);
      }
    };
    load();
  }, [user?.role]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("nameRequired"));
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
      setError(err.response?.data?.message || err.message || t("errorSaving"));
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
    if (pwd.length < 8) return t("changePassword.passwordMinLength");
    if (!/[A-Z]/.test(pwd)) return t("changePassword.passwordUppercase");
    if (!/\d/.test(pwd)) return t("changePassword.passwordNumber");
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("changePassword.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("changePassword.passwordMismatch"));
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
      setPasswordError(err.response?.data?.message || err.message || t("changePassword.error"));
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

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setDeleteError(t("dangerZone.modal.passwordRequired"));
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await userService.deleteAccount(deletePassword);
      signout();
      navigate("/", { state: { message: t("dangerZone.modal.successMessage") } });
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || err.message || t("dangerZone.modal.error")
      );
      setDeleting(false);
    }
  };

  const handleLinkStudent = async (e) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;
    setLinkingStudent(true);
    setStudentError("");
    setStudentSuccess("");
    try {
      const student = await trainerService.linkStudent(studentEmail.trim());
      setStudents(prev => [...prev, student]);
      setStudentEmail("");
      setStudentSuccess(t("trainer.linkSuccess"));
    } catch (err) {
      setStudentError(err.response?.data?.message || err.message || t("trainer.errorLinking"));
    } finally {
      setLinkingStudent(false);
    }
  };

  const handleUnlinkStudent = async (studentId) => {
    try {
      await trainerService.unlinkStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      setStudentError(err.response?.data?.message || err.message || t("trainer.errorUnlinking"));
    }
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
              {t("title")}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              {t("subtitle")}
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
                  {t("nameLabel")}
                </label>
                <input
                  type="text"
                  value={name}
                  maxLength={100}
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
                  {t("emailLabel")}
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
                  {t("updateSuccess")}
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
                  {saving ? t("saving") : t("saveChanges")}
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
                  {t("cancel")}
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
              {t("changePassword.title")}
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
                  {t("changePassword.currentPassword")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      setPasswordError("");
                      setPasswordSuccess(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 36px 9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    disabled={changingPassword}
                  />
                  <EyeIcon visible={showOldPass} onToggle={() => setShowOldPass(v => !v)} />
                </div>
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
                  {t("changePassword.newPassword")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                      setPasswordSuccess(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 36px 9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    disabled={changingPassword}
                  />
                  <EyeIcon visible={showNewPass} onToggle={() => setShowNewPass(v => !v)} />
                </div>
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
                  {t("changePassword.confirmNewPassword")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                      setPasswordSuccess(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 36px 9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    disabled={changingPassword}
                  />
                  <EyeIcon visible={showConfirmPass} onToggle={() => setShowConfirmPass(v => !v)} />
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  margin: "12px 0 16px",
                }}
              >
                {t("changePassword.passwordHint")}
              </p>

              {passwordError && (
                <p style={{ color: "var(--accent-alt)", fontSize: 13, marginBottom: 12 }}>
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p style={{ color: "var(--success)", fontSize: 13, marginBottom: 12 }}>
                  {t("changePassword.success")}
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
                  {changingPassword ? t("changePassword.saving") : t("changePassword.saveButton")}
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
                  {t("changePassword.cancel")}
                </button>
              </div>
            </form>
          </div>

          {user?.role === 'PERSONAL_TRAINER' && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginTop: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, marginTop: 0 }}>
                {t("trainer.studentsTitle")}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}>
                {t("trainer.studentsSubtitle")}
              </p>

              <form onSubmit={handleLinkStudent} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder={t("trainer.emailPlaceholder")}
                  disabled={linkingStudent}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                />
                <button
                  type="submit"
                  disabled={linkingStudent || !studentEmail.trim()}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", fontWeight: 600, fontSize: 13, cursor: linkingStudent ? "not-allowed" : "pointer", opacity: linkingStudent ? 0.7 : 1 }}
                >
                  {linkingStudent ? t("trainer.linking") : t("trainer.linkButton")}
                </button>
              </form>

              {studentError && <p style={{ color: "var(--accent-alt)", fontSize: 13, marginBottom: 8 }}>{studentError}</p>}
              {studentSuccess && <p style={{ color: "var(--success)", fontSize: 13, marginBottom: 8 }}>{studentSuccess}</p>}

              {studentsLoading ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("trainer.loading")}</p>
              ) : students.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("trainer.noStudents")}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {students.map((student) => (
                    <div key={student.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{student.name}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{student.email}</span>
                      </div>
                      <button
                        onClick={() => handleUnlinkStudent(student.id)}
                        style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "2px 8px" }}
                      >
                        {t("trainer.unlink")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              {t("dangerZone.title")}
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                margin: "0 0 16px",
              }}
            >
              {t("dangerZone.description")}
            </p>
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#dc3545",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t("dangerZone.deleteButton")}
            </button>
          </div>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton={!deleting}>
          <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
            {t("dangerZone.modal.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "#dc3545", fontSize: 14, marginBottom: 16 }}>
            {t("dangerZone.modal.warning")}
          </p>
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
            {t("dangerZone.modal.passwordLabel")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showDeletePass ? "text" : "password"}
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError("");
              }}
              disabled={deleting}
              autoFocus
              style={{
                width: "100%",
                padding: "9px 36px 9px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <EyeIcon visible={showDeletePass} onToggle={() => setShowDeletePass(v => !v)} />
          </div>
          {deleteError && (
            <p style={{ color: "#dc3545", fontSize: 13, marginTop: 12, marginBottom: 0 }}>
              {deleteError}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            onClick={handleCloseDeleteModal}
            disabled={deleting}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: 13,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {t("dangerZone.modal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting || !deletePassword}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#dc3545",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: deleting || !deletePassword ? "not-allowed" : "pointer",
              opacity: deleting || !deletePassword ? 0.6 : 1,
            }}
          >
            {deleting ? t("dangerZone.modal.deleting") : t("dangerZone.modal.confirmButton")}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AccountPage;
