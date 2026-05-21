import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import useAuth from "../../hooks/useAuth";
import { PlusCircle, Trash } from "react-bootstrap-icons";
import "./styles.css";


function LogExecutionModal({ show, exercise, workoutId, onClose, onLogged, t }) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setWeight("");
      setReps("");
      setSets("");
      setDifficulty("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        weight: weight !== "" ? parseFloat(weight) : null,
        reps: reps !== "" ? parseInt(reps, 10) : null,
        sets: sets !== "" ? parseInt(sets, 10) : null,
        difficulty: difficulty || null,
      };
      const log = await exerciseService.logExecution(workoutId, exercise.id, payload);
      onLogged(log);
      onClose();
    } catch (err) {
      setError(err.message || t("workoutDetail.history.errorLogging"));
    } finally {
      setSaving(false);
    }
  };

  if (!exercise) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          {t("workoutDetail.logModal.title", { name: exercise.name })}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger py-2 small">{error}</div>
          )}
          <Row className="g-3">
            <Col xs={4}>
              <Form.Label className="small">
                {t("workoutDetail.logModal.setsLabel")}
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder={t("workoutDetail.logModal.setsPlaceholder")}
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                disabled={saving}
              />
            </Col>
            <Col xs={4}>
              <Form.Label className="small">
                {t("workoutDetail.logModal.repsLabel")}
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder={t("workoutDetail.logModal.repsPlaceholder")}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                disabled={saving}
              />
            </Col>
            <Col xs={4}>
              <Form.Label className="small">
                {t("workoutDetail.logModal.weightLabel")}
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.5"
                placeholder={t("workoutDetail.logModal.weightPlaceholder")}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={saving}
              />
            </Col>
          </Row>
          <Form.Group className="mt-3">
            <Form.Label className="small">{t("workoutDetail.logModal.difficultyLabel")}</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {["EASY", "MODERATE", "HARD", "MAX"].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn btn-sm ${difficulty === d ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setDifficulty(prev => prev === d ? "" : d)}
                  disabled={saving}
                >
                  {t(`workoutDetail.logModal.difficulty.${d}`)}
                </button>
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            Text={t("workoutDetail.logModal.cancel")}
            onClick={onClose}
            disabled={saving}
            size="sm"
          />
          <Button
            Text={saving
              ? t("workoutDetail.logModal.saving")
              : t("workoutDetail.logModal.save")}
            type="submit"
            disabled={saving}
            size="sm"
          />
        </Modal.Footer>
      </form>
    </Modal>
  );
}

function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signed, user } = useAuth();
  const { t } = useTranslation("workouts");

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("");
  const [newExerciseRepsMin, setNewExerciseRepsMin] = useState("");
  const [newExerciseRepsMax, setNewExerciseRepsMax] = useState("");
  const [newExerciseWeight, setNewExerciseWeight] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(id);
  const [logModalExercise, setLogModalExercise] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimer = React.useRef(null);

  const fetchSuggestions = (query) => {
    clearTimeout(suggestionTimer.current);
    if (!query || query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestionTimer.current = setTimeout(async () => {
      const results = await exerciseService.getSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);
  };

  const [shareEmails, setShareEmails] = useState("");
  const [sharePermission, setSharePermission] = useState("READ");
  const [sharing, setSharing] = useState(false);
  const [shareResult, setShareResult] = useState(null);

  const isOwner = workout && user && workout.userId === user.id;

  const handleShare = async (e) => {
    e.preventDefault();
    const emails = shareEmails
      .split(/[,;\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (emails.length === 0) return;

    try {
      setSharing(true);
      setShareResult(null);
      const result = await workoutService.bulkShare(id, emails, sharePermission);
      setShareResult(result);
      setShareEmails("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("workoutDetail.errorSharing"));
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (!signed) {
      navigate("/signin");
      return;
    }

    setCurrentWorkoutId(id);
    let mounted = true;

    const loadWorkout = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await workoutService.getWorkout(id);
        if (mounted) {
          setWorkout(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || err.message || t("workoutDetail.errorLoading"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWorkout();

    return () => {
      mounted = false;
    };
  }, [id, signed, navigate, t]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) {
      setError(t("workoutDetail.errorEmptyName"));
      return;
    }

    try {
      setAddingExercise(true);
      setError("");
      const newExercise = await exerciseService.createExercise(
        id, newExerciseName,
        newExerciseSets !== "" ? parseInt(newExerciseSets, 10) : null,
        newExerciseRepsMin !== "" ? parseInt(newExerciseRepsMin, 10) : null,
        newExerciseRepsMax !== "" ? parseInt(newExerciseRepsMax, 10) : null,
        newExerciseWeight !== "" ? parseFloat(newExerciseWeight) : null
      );
      if (currentWorkoutId === id) {
        setWorkout({
          ...workout,
          exercises: [...(workout.exercises || []), newExercise],
        });
        setNewExerciseName("");
        setNewExerciseSets("");
        setNewExerciseRepsMin("");
        setNewExerciseRepsMax("");
        setNewExerciseWeight("");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("workoutDetail.errorAdding"));
    } finally {
      setAddingExercise(false);
    }
  };

  const handleToggleExercise = async (exerciseId) => {
    try {
      setError("");
      const updatedExercise = await exerciseService.toggleExercise(id, exerciseId);
      if (currentWorkoutId === id) {
        setWorkout({
          ...workout,
          exercises: workout.exercises.map((ex) =>
            ex.id === exerciseId ? updatedExercise : ex
          ),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("workoutDetail.errorToggling"));
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm(t("workoutDetail.confirmDeleteExercise"))) {
      return;
    }

    try {
      setError("");
      await exerciseService.deleteExercise(id, exerciseId);
      if (currentWorkoutId === id) {
        setWorkout({
          ...workout,
          exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("workoutDetail.errorDeleting"));
    }
  };

  const handleUpdateExercise = async (exerciseId, name, sets, repsMin, repsMax, weight) => {
    try {
      setError("");
      const updatedExercise = await exerciseService.updateExercise(
        id,
        exerciseId,
        name,
        sets,
        repsMin,
        repsMax,
        weight
      );
      if (currentWorkoutId === id) {
        setWorkout({
          ...workout,
          exercises: workout.exercises.map((ex) =>
            ex.id === exerciseId ? updatedExercise : ex
          ),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("workoutDetail.errorUpdating"));
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t("workoutDetail.loadingWorkout")}</span>
          </Spinner>
        </div>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px" }}>
          <p>{t("workoutDetail.notFound")}</p>
          <Button
            Text={t("workoutDetail.back")}
            onClick={() => navigate("/myworkouts")}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>{workout.name}</h1>
            {workout.isPublic && (
              <span className="badge bg-info">{t("common:public")}</span>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button Text={t("workoutDetail.back")} onClick={() => navigate("/myworkouts")} size="sm" />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Card className="mb-4">
          <Card.Header>
            <Card.Title className="mb-0">{t("workoutDetail.exercisesTitle")}</Card.Title>
          </Card.Header>
          <Card.Body>
            {workout.exercises && workout.exercises.length > 0 ? (
              <div className="exercises-list">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="exercise-item mb-3 p-3 border rounded">
                    <Row className="align-items-center">
                      <Col xs={1}>
                        <input
                          key={`${currentWorkoutId}-${exercise.id}`}
                          type="checkbox"
                          checked={exercise.completed || false}
                          onChange={() => handleToggleExercise(exercise.id)}
                          style={{ width: 18, height: 18, cursor: "pointer" }}
                        />
                      </Col>
                      <Col xs={6}>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={exercise.name}
                          maxLength={255}
                          onBlur={(e) => {
                            if (e.target.value !== exercise.name) {
                              handleUpdateExercise(exercise.id, e.target.value, exercise.sets, exercise.repsMin, exercise.repsMax, exercise.weight);
                            }
                          }}
                        />
                        {(exercise.sets || exercise.repsMin || exercise.weight) && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {exercise.sets && <span className="me-2">{exercise.sets} {t("workoutDetail.seriesLabel")}</span>}
                            {exercise.repsMin && (
                              <span className="me-2">
                                {exercise.repsMin}{exercise.repsMax && exercise.repsMax !== exercise.repsMin ? `–${exercise.repsMax}` : ""} {t("workoutDetail.repsLabel")}
                              </span>
                            )}
                            {exercise.weight && <span>{exercise.weight} kg</span>}
                          </div>
                        )}
                      </Col>
                      <Col xs={5} className="text-end d-flex justify-content-end align-items-center gap-2">
                        <button
                          onClick={() => setLogModalExercise(exercise)}
                          aria-label={t("workoutDetail.logExecution")}
                          title={t("workoutDetail.logExecution")}
                          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#0d6efd" }}
                        >
                          <PlusCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          aria-label={t("workoutDetail.deleteExercise")}
                          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#dc3545" }}
                        >
                          <Trash size={16} />
                        </button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <p className="mb-0">{t("workoutDetail.noExercises")}</p>
              </div>
            )}

            <hr />

            <div className="mb-3">
              <Form.Label>{t("workoutDetail.addNewExercise")}</Form.Label>
              <Form.Group className="mb-2">
                <div style={{ position: "relative" }}>
                  <Form.Control
                    type="text"
                    placeholder={t("workoutDetail.exerciseNamePlaceholder")}
                    value={newExerciseName}
                    onChange={(e) => {
                      setNewExerciseName(e.target.value);
                      fetchSuggestions(e.target.value);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    disabled={addingExercise}
                    maxLength={255}
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000,
                      background: "var(--bg-card)", border: "1px solid var(--border)",
                      borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxHeight: 200, overflowY: "auto"
                    }}>
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}
                          onMouseDown={() => { setNewExerciseName(s); setShowSuggestions(false); setSuggestions([]); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Row className="mt-2 g-2">
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t("workoutDetail.setsPlaceholder")}
                      value={newExerciseSets}
                      onChange={(e) => setNewExerciseSets(e.target.value)}
                      disabled={addingExercise}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t("workoutDetail.repsMinPlaceholder")}
                      value={newExerciseRepsMin}
                      onChange={(e) => setNewExerciseRepsMin(e.target.value)}
                      disabled={addingExercise}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t("workoutDetail.repsMaxPlaceholder")}
                      value={newExerciseRepsMax}
                      onChange={(e) => setNewExerciseRepsMax(e.target.value)}
                      disabled={addingExercise}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="0" step="0.5" size="sm"
                      placeholder={t("workoutDetail.weightPlaceholder")}
                      value={newExerciseWeight}
                      onChange={(e) => setNewExerciseWeight(e.target.value)}
                      disabled={addingExercise}
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Button
                Text={addingExercise ? t("workoutDetail.adding") : t("workoutDetail.addButton")}
                onClick={handleAddExercise}
                disabled={addingExercise || !newExerciseName.trim()}
              />
            </div>
          </Card.Body>
        </Card>

        {isOwner && user?.role === 'PERSONAL_TRAINER' && (
          <Card className="mb-4">
            <Card.Header>
              <Card.Title className="mb-0">{t("workoutDetail.shareTitle")}</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                {t("workoutDetail.shareHint")}
              </p>

              {shareResult && (
                <Alert
                  variant={shareResult.shared > 0 ? "success" : "warning"}
                  dismissible
                  onClose={() => setShareResult(null)}
                  className="mb-3"
                >
                  {shareResult.shared > 0 && (
                    <span>{t("workoutDetail.shareResultShared", { count: shareResult.shared })} </span>
                  )}
                  {shareResult.alreadyShared > 0 && (
                    <span>{t("workoutDetail.shareResultAlready", { count: shareResult.alreadyShared })} </span>
                  )}
                  {shareResult.notFound && shareResult.notFound.length > 0 && (
                    <span>
                      {t("workoutDetail.shareResultNotFound", { count: shareResult.notFound.length })}
                      {": "}
                      {shareResult.notFound.map((email, i) => (
                        <Badge key={i} bg="secondary" className="me-1">{email}</Badge>
                      ))}
                    </span>
                  )}
                </Alert>
              )}

              <Form onSubmit={handleShare}>
                <Form.Group className="mb-2">
                  <Form.Label>{t("workoutDetail.shareEmailsLabel")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("workoutDetail.shareEmailsPlaceholder")}
                    value={shareEmails}
                    onChange={(e) => setShareEmails(e.target.value)}
                    disabled={sharing}
                  />
                  <Form.Text className="text-muted">
                    {t("workoutDetail.shareEmailsHint")}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("workoutDetail.sharePermissionLabel")}</Form.Label>
                  <Form.Select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    disabled={sharing}
                    style={{ maxWidth: 200 }}
                  >
                    <option value="READ">{t("workoutDetail.permissionRead")}</option>
                    <option value="EDIT">{t("workoutDetail.permissionEdit")}</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  Text={sharing ? t("workoutDetail.sharing") : t("workoutDetail.shareButton")}
                  onClick={handleShare}
                  disabled={sharing || !shareEmails.trim()}
                />
              </Form>
            </Card.Body>
          </Card>
        )}
      </div>

      <LogExecutionModal
        show={logModalExercise !== null}
        exercise={logModalExercise}
        workoutId={id}
        onClose={() => setLogModalExercise(null)}
        onLogged={() => {}}
        t={t}
      />
    </>
  );
}

export default WorkoutDetailPage;
