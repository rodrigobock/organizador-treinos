import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import useAuth from "../../hooks/useAuth";
import { downloadJson } from "../../utils/downloadJson";
import { Trash } from "react-bootstrap-icons";
import "./styles.css";

function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signed } = useAuth();
  const { t } = useTranslation("workouts");

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(id);

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
          setError(err.message || t("workoutDetail.errorLoading"));
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
      const newExercise = await exerciseService.createExercise(id, newExerciseName);
      if (currentWorkoutId === id) {
        setWorkout({
          ...workout,
          exercises: [...(workout.exercises || []), newExercise],
        });
        setNewExerciseName("");
      }
    } catch (err) {
      setError(err.message || t("workoutDetail.errorAdding"));
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
      setError(err.message || t("workoutDetail.errorToggling"));
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
      setError(err.message || t("workoutDetail.errorDeleting"));
    }
  };

  const handleUpdateExercise = async (exerciseId, newName) => {
    try {
      setError("");
      const updatedExercise = await exerciseService.updateExercise(
        id,
        exerciseId,
        newName
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
      setError(err.message || t("workoutDetail.errorUpdating"));
    }
  };

  const handleExportJson = () => {
    const data = {
      version: 1,
      workouts: [{
        name: workout.name,
        exercises: (workout.exercises || []).map(e => ({ name: e.name, completed: e.completed })),
      }],
    };
    downloadJson(`${workout.name.replace(/\s+/g, '-').toLowerCase()}.json`, data);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px" }}>
          <p>{t("workoutDetail.loadingWorkout")}</p>
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
            <Button Text={t("workoutDetail.exportJson")} onClick={handleExportJson} size="sm" />
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
                      <Col xs={7}>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={exercise.name}
                          onBlur={(e) => {
                            if (e.target.value !== exercise.name) {
                              handleUpdateExercise(exercise.id, e.target.value);
                            }
                          }}
                        />
                      </Col>
                      <Col xs={4} className="text-end">
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
              <p>{t("workoutDetail.noExercises")}</p>
            )}

            <hr />

            <div className="mb-3">
              <Form.Label>{t("workoutDetail.addNewExercise")}</Form.Label>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  placeholder={t("workoutDetail.exerciseNamePlaceholder")}
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  disabled={addingExercise}
                />
              </Form.Group>
              <Button
                Text={addingExercise ? t("workoutDetail.adding") : t("workoutDetail.addButton")}
                onClick={handleAddExercise}
                disabled={addingExercise || !newExerciseName.trim()}
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default WorkoutDetailPage;
