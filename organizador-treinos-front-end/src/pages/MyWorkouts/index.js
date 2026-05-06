import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import workoutService from "../../services/workoutService";
import useAuth from "../../hooks/useAuth";

function MyWorkoutsPage() {
  const { signed, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !signed) {
      navigate("/signin");
      return;
    }

    const loadWorkouts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await workoutService.getMyWorkouts();
        setWorkouts(data);
      } catch (err) {
        setError(err.message || "Erro ao carregar treinos");
      } finally {
        setLoading(false);
      }
    };

    if (signed) {
      loadWorkouts();
    }
  }, [signed, authLoading, navigate]);

  const handleViewWorkout = (id) => {
    navigate(`/workout/${id}`);
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este treino?")) {
      return;
    }

    try {
      await workoutService.deleteWorkout(id);
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (err) {
      setError(err.message || "Erro ao deletar treino");
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px" }}>
          <p>Carregando treinos...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Meus Treinos</h1>
          <Button
            Text="+ Novo Treino"
            onClick={() => navigate("/newworkout")}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {workouts.length === 0 ? (
          <Card>
            <Card.Body>
              <Card.Text>
                Você não tem treinos ainda. Clique em "+ Novo Treino" para
                começar!
              </Card.Text>
            </Card.Body>
          </Card>
        ) : (
          <div className="workouts-grid">
            {workouts.map((workout) => (
              <Card key={workout.id} className="workout-card">
                <Card.Body>
                  <Card.Title>{workout.name}</Card.Title>
                  <Card.Text>
                    {workout.isPublic && (
                      <span className="badge bg-info">Público</span>
                    )}
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      Text="Ver"
                      onClick={() => handleViewWorkout(workout.id)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      Text="Deletar"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      style={{ flex: 1, backgroundColor: "#dc3545" }}
                    />
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MyWorkoutsPage;
