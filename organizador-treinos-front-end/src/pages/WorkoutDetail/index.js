import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import useAuth from "../../hooks/useAuth";
import "./styles.css";

function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signed } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);

  useEffect(() => {
    if (!signed) {
      navigate("/signin");
      return;
    }

    const loadWorkout = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await workoutService.getWorkout(id);
        setWorkout(data);
      } catch (err) {
        setError(err.message || "Erro ao carregar treino");
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [id, signed, navigate]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) {
      setError("Nome do exercício não pode estar vazio");
      return;
    }

    try {
      setAddingExercise(true);
      setError("");
      const newExercise = await exerciseService.createExercise(id, newExerciseName);
      setWorkout({
        ...workout,
        exercises: [...(workout.exercises || []), newExercise],
      });
      setNewExerciseName("");
    } catch (err) {
      setError(err.message || "Erro ao adicionar exercício");
    } finally {
      setAddingExercise(false);
    }
  };

  const handleToggleExercise = async (exerciseId) => {
    try {
      setError("");
      const updatedExercise = await exerciseService.toggleExercise(id, exerciseId);
      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.id === exerciseId ? updatedExercise : ex
        ),
      });
    } catch (err) {
      setError(err.message || "Erro ao atualizar exercício");
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("Tem certeza que deseja deletar este exercício?")) {
      return;
    }

    try {
      setError("");
      await exerciseService.deleteExercise(id, exerciseId);
      setWorkout({
        ...workout,
        exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
      });
    } catch (err) {
      setError(err.message || "Erro ao deletar exercício");
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
      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.id === exerciseId ? updatedExercise : ex
        ),
      });
    } catch (err) {
      setError(err.message || "Erro ao atualizar exercício");
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px" }}>
          <p>Carregando treino...</p>
        </div>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px" }}>
          <p>Treino não encontrado</p>
          <Button
            Text="Voltar"
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
              <span className="badge bg-info">Público</span>
            )}
          </div>
          <Button
            Text="Voltar"
            onClick={() => navigate("/myworkouts")}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Card className="mb-4">
          <Card.Header>
            <Card.Title className="mb-0">Exercícios</Card.Title>
          </Card.Header>
          <Card.Body>
            {workout.exercises && workout.exercises.length > 0 ? (
              <div className="exercises-list">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="exercise-item mb-3 p-3 border rounded">
                    <Row className="align-items-center">
                      <Col xs={1}>
                        <Form.Check
                          type="checkbox"
                          checked={exercise.completed || false}
                          onChange={() => handleToggleExercise(exercise.id)}
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
                        <Button
                          Text="Deletar"
                          onClick={() => handleDeleteExercise(exercise.id)}
                          style={{ backgroundColor: "#dc3545", color: "white" }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum exercício adicionado ainda.</p>
            )}

            <hr />

            <div className="mb-3">
              <Form.Label>Adicionar Novo Exercício</Form.Label>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Nome do exercício"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  disabled={addingExercise}
                />
              </Form.Group>
              <Button
                Text={addingExercise ? "Adicionando..." : "+ Adicionar"}
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
