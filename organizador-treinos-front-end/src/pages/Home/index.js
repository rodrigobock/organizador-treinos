import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Spinner from "react-bootstrap/Spinner";
import NavBar from "../../components/NavBar";
import workoutService from "../../services/workoutService";
import sessionService from "../../services/sessionService";
import trainerService from "../../services/trainerService";
import useAuth from "../../hooks/useAuth";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent ? "var(--accent)" : "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

function QuickActionCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 12px",
        cursor: "pointer",
        textAlign: "center",
        color: "var(--text-primary)",
        width: "100%",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
    </button>
  );
}

function TrainerDashboard({ user, navigate }) {
  const [students, setStudents] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([trainerService.getStudents(), workoutService.getSharedByMe()])
      .then(([s, sh]) => { setStudents(s); setSharedItems(sh); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const studentStats = useMemo(() => {
    const map = {};
    sharedItems.forEach(item => {
      item.shares.forEach(share => {
        if (!map[share.userId]) map[share.userId] = { workoutCount: 0, lastAccess: null };
        map[share.userId].workoutCount++;
        if (share.lastAccessedAt) {
          const d = new Date(share.lastAccessedAt);
          if (!map[share.userId].lastAccess || d > map[share.userId].lastAccess) {
            map[share.userId].lastAccess = d;
          }
        }
      });
    });
    return map;
  }, [sharedItems]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeCount = students.filter(s => studentStats[s.id]?.lastAccess > sevenDaysAgo).length;
  const totalWorkoutsShared = new Set(sharedItems.map(i => i.workoutId)).size;
  const firstName = user?.name?.split(" ")[0] || "";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Spinner animation="border" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Olá, {firstName} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Painel do personal trainer
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--accent-alt)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        <StatCard label="Alunos" value={students.length} />
        <StatCard label="Treinos compartilhados" value={totalWorkoutsShared} accent />
        <StatCard label="Ativos (7 dias)" value={activeCount} />
      </div>

      {/* Quick actions */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 10 }}>
        Ações rápidas
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
        <QuickActionCard icon="🏋️" label="Meus treinos" onClick={() => navigate("/myworkouts")} />
        <QuickActionCard icon="📤" label="Compartilhamentos" onClick={() => navigate("/shared-by-me")} />
        <QuickActionCard icon="➕" label="Novo treino" onClick={() => navigate("/newworkout")} />
      </div>

      {/* Student list */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 10 }}>
        Meus alunos
      </div>

      {students.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Nenhum aluno vinculado ainda.
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {students.map((student, idx) => {
            const stats = studentStats[student.id] || { workoutCount: 0, lastAccess: null };
            const isActive = stats.lastAccess && stats.lastAccess > sevenDaysAgo;
            return (
              <div
                key={student.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: idx < students.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
                }}>
                  {student.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.email}
                  </div>
                </div>

                {/* Treinos */}
                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 52 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{stats.workoutCount}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>treinos</div>
                </div>

                {/* Último acesso */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                  <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                    {stats.lastAccess ? formatDate(stats.lastAccess.toISOString()) : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>último acesso</div>
                </div>

                {/* Badge ativo */}
                <div style={{
                  flexShrink: 0,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  background: isActive ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                  color: isActive ? "var(--success)" : "var(--text-muted)",
                }}>
                  {isActive ? "ativo" : "inativo"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("workouts");
  const [workouts, setWorkouts] = useState([]);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const loadActiveSession = useCallback(async (workoutId) => {
    const session = await sessionService.getActiveSession(workoutId);
    setActiveSession(session);
  }, []);

  const loadWorkoutById = useCallback(async (workoutId) => {
    const detail = await workoutService.getWorkout(workoutId);
    setLatestWorkout(detail);
    await loadActiveSession(workoutId);
  }, [loadActiveSession]);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await workoutService.getMyWorkouts();
        setWorkouts(all);
        if (all.length > 0) {
          const targetId = user?.currentWorkoutId || all[0].id;
          const exists = all.find(w => w.id === targetId);
          const workoutId = exists ? targetId : all[0].id;
          await loadWorkoutById(workoutId);
        }
      } catch (err) {
        setError(err.message || t("home.errorLoading"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadWorkoutById, user?.currentWorkoutId, t]);

  const handleToggle = (exerciseId) => {
    if (!latestWorkout || !activeSession) return;
    setLatestWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      ),
    }));
  };

  const handleStartSession = async () => {
    if (!latestWorkout) return;
    setSessionLoading(true);
    try {
      const session = await sessionService.startSession(latestWorkout.id);
      setActiveSession(session);
    } catch (err) {
      setError(err.response?.data?.message || t("home.errorStarting"));
    } finally {
      setSessionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!latestWorkout || !activeSession) return;
    setSessionLoading(true);
    try {
      await sessionService.endSession(latestWorkout.id, activeSession.id);
      setActiveSession(null);
      const updatedUser = await reloadUser();
      const all = await workoutService.getMyWorkouts();
      setWorkouts(all);
      if (all.length > 0 && updatedUser?.currentWorkoutId) {
        const exists = all.find(w => w.id === updatedUser.currentWorkoutId);
        if (exists) {
          await loadWorkoutById(updatedUser.currentWorkoutId);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t("home.errorEnding"));
    } finally {
      setSessionLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "";
  const exercises = latestWorkout?.exercises || [];
  const completed = exercises.filter(ex => ex.completed).length;
  const total = exercises.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (user?.role === "PERSONAL_TRAINER") {
    return (
      <>
        <NavBar />
        <TrainerDashboard user={user} navigate={navigate} />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "80px 16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spinner animation="border" role="status" style={{ color: "var(--accent, #f59e0b)" }}>
              <span className="visually-hidden">{t("home.loadingHome")}</span>
            </Spinner>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12 }}>
              {t("home.loadingHome")}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div
        style={{
          padding: "24px 16px",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                {t("home.greeting", { name: firstName })} 👋
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                {t("home.subtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/newworkout")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t("home.newWorkout")}
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {[
              { label: t("home.stats.myWorkouts"), value: workouts.length, accent: false },
              { label: t("home.stats.exercises"), value: total, accent: true },
              { label: t("home.stats.completed"), value: completed, accent: false },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: stat.accent ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--accent-alt)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Empty state */}
          {workouts.length === 0 && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
              <h3
                style={{
                  color: "var(--text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {t("home.emptyTitle")}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
                {t("home.emptyDescription")}
              </p>
              <button
                onClick={() => navigate("/newworkout")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t("home.createFirst")}
              </button>
            </div>
          )}

          {/* Next workout */}
          {latestWorkout && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                {t("home.nextWorkout")}
              </div>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: activeSession
                    ? "1px solid var(--success)"
                    : "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 18px 14px",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {latestWorkout.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 4,
                      background: "rgba(245,158,11,0.1)",
                      color: "var(--accent)",
                    }}
                  >
                    {completed} / {total}
                  </span>
                </div>

                {exercises.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {t("home.noExercises")}
                  </p>
                ) : (
                  exercises.map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => handleToggle(ex.id)}
                      title={!activeSession ? t("home.startSessionHint") : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "9px 0",
                        borderBottom: "1px solid var(--border)",
                        cursor: activeSession ? "pointer" : "default",
                        opacity: activeSession ? 1 : 0.5,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${ex.completed ? "var(--success)" : "var(--border)"}`,
                          background: ex.completed ? "var(--success)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {ex.completed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: ex.completed ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: ex.completed ? "line-through" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {ex.name}
                      </span>
                    </div>
                  ))
                )}

                {total > 0 && (
                  <div
                    style={{
                      height: 4,
                      background: "var(--border)",
                      borderRadius: 2,
                      marginTop: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, var(--accent), var(--accent-alt))",
                        borderRadius: 2,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                )}

                {/* Start / End buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {activeSession ? (
                    <button
                      onClick={handleEndSession}
                      disabled={sessionLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 8,
                        border: "none",
                        background: "#dc3545",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: sessionLoading ? "not-allowed" : "pointer",
                        opacity: sessionLoading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {sessionLoading && (
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                      )}
                      {sessionLoading ? t("home.endingSession") : t("home.endSession")}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartSession}
                      disabled={sessionLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--success, #22c55e)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: sessionLoading ? "not-allowed" : "pointer",
                        opacity: sessionLoading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {sessionLoading && (
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                      )}
                      {sessionLoading ? t("home.startingSession") : t("home.startSession")}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/workout/${latestWorkout.id}`)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("home.viewFull")} →
                  </button>
                </div>

                {activeSession && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: "var(--success, #22c55e)",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {t("home.sessionActive")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage;
