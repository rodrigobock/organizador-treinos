import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import workoutService from "../../services/workoutService";
import { downloadJson } from "../../utils/downloadJson";
import useAuth from "../../hooks/useAuth";

function MyWorkoutsPage() {
  const { signed, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [userActions, setUserActions] = useState({});
  const [importing, setImporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

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

  const handleExportAll = async () => {
    if (workouts.length === 0) return;
    try {
      setExportingAll(true);
      const workoutsWithExercises = await Promise.all(
        workouts.map((w) => workoutService.getWorkout(w.id))
      );
      const data = {
        version: 1,
        workouts: workoutsWithExercises.map((w) => ({
          name: w.name,
          exercises: (w.exercises || []).map((e) => ({ name: e.name, completed: e.completed })),
        })),
      };
      downloadJson("my-workouts.json", data);
    } catch (err) {
      setError("Erro ao exportar treinos");
    } finally {
      setExportingAll(false);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setError("Arquivo JSON inválido");
      return;
    }

    if (parsed.version !== 1 || !Array.isArray(parsed.workouts)) {
      setError("Versão de arquivo não suportada ou formato inválido");
      return;
    }

    if (parsed.workouts.length === 0) {
      setError("Nenhum treino encontrado no arquivo");
      return;
    }

    try {
      setImporting(true);
      setError("");
      const analysis = await workoutService.analyzeImport(parsed.workouts);
      const defaults = {};
      analysis.forEach((item, idx) => {
        defaults[idx] = item.status === "clean" ? "create" : "skip";
      });
      setUserActions(defaults);
      setImportAnalysis(analysis);
    } catch (err) {
      setError(typeof err === "string" ? err : "Erro ao analisar arquivo");
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const items = importAnalysis.map((item, idx) => ({
      workout: item.workout,
      action: item.status === "clean" ? "create" : (userActions[idx] || "skip"),
      conflictId: item.conflictId || null,
    }));

    try {
      setImporting(true);
      const result = await workoutService.confirmImport(items);
      setImportAnalysis(null);
      setUserActions({});
      const updated = await workoutService.getMyWorkouts();
      setWorkouts(updated);
      const parts = [];
      if (result.created > 0) parts.push(`${result.created} criado(s)`);
      if (result.replaced > 0) parts.push(`${result.replaced} substituído(s)`);
      if (result.skipped > 0) parts.push(`${result.skipped} ignorado(s)`);
      alert(`Importação concluída: ${parts.join(", ")}`);
    } catch (err) {
      setError(typeof err === "string" ? err : "Erro ao importar treinos");
    } finally {
      setImporting(false);
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
          <div className="d-flex gap-2">
            <Button
              Text={exportingAll ? "Exportando..." : "Exportar JSON"}
              onClick={handleExportAll}
              disabled={exportingAll || workouts.length === 0}
              size="sm"
            />
            <Button
              Text={importing ? "Importando..." : "Importar JSON"}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={importing}
              size="sm"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportFileChange}
            />
            <Button
              Text="+ Novo Treino"
              onClick={() => navigate("/newworkout")}
              size="sm"
            />
          </div>
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

      <Modal show={importAnalysis !== null} onHide={() => setImportAnalysis(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Importar Treinos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Treino</th>
                <th>Exercícios</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {(importAnalysis || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.workout.name}</td>
                  <td>{(item.workout.exercises || []).length} exercício(s)</td>
                  <td>
                    {item.status === "clean" ? (
                      <span className="badge bg-success">Novo</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        Duplicado ({Math.round(item.similarity * 100)}%)
                      </span>
                    )}
                  </td>
                  <td>
                    {item.status === "clean" ? (
                      <span className="text-muted">Será criado</span>
                    ) : (
                      <Form.Select
                        size="sm"
                        value={userActions[idx] || "skip"}
                        onChange={(e) =>
                          setUserActions({ ...userActions, [idx]: e.target.value })
                        }
                      >
                        <option value="create">Criar novo (nome duplicado)</option>
                        <option value="replace">Substituir</option>
                        <option value="skip">Ignorar</option>
                      </Form.Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button Text="Cancelar" onClick={() => setImportAnalysis(null)} />
          <Button
            Text={importing ? "Importando..." : "Confirmar Importação"}
            onClick={handleConfirmImport}
            disabled={importing}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MyWorkoutsPage;
