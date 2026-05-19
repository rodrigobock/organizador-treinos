import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import sessionService from "../../services/sessionService";
import useAuth from "../../hooks/useAuth";

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

  const handleToggle = async (exerciseId) => {
    if (!latestWorkout || !activeSession) return;
    try {
      const updated = await exerciseService.toggleExercise(latestWorkout.id, exerciseId);
      setLatestWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => (ex.id === exerciseId ? updated : ex)),
      }));
    } catch (_) {}
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

  return (
    <>
      <NavBar />
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          backgroundColor: "var(--bg-primary)",
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
                {loading ? t("home.loadingSubtitle") : t("home.subtitle")}
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
                  {loading ? "—" : stat.value}
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
          {!loading && workouts.length === 0 && (
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
          {!loading && latestWorkout && (
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
                      }}
                    >
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
                      }}
                    >
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
