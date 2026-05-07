import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import workoutService from "../../services/workoutService";
import { downloadJson } from "../../utils/downloadJson";
import useAuth from "../../hooks/useAuth";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash, PencilSquare, GripVertical } from "react-bootstrap-icons";

const PAGE_SIZE = 10;

function SortableWorkoutCard({ workout, onView, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: workout.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="workout-card mb-2">
        <Card.Body className="d-flex align-items-center gap-2 py-2">
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: "grab", color: "var(--text-muted, #888)", flexShrink: 0 }}
          >
            <GripVertical size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{workout.name}</div>
            {workout.isPublic && <span className="badge bg-info" style={{ fontSize: 10 }}>Público</span>}
          </div>
          <button
            onClick={() => onView(workout.id)}
            aria-label="Editar treino"
            style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", color: "var(--text-muted, #555)" }}
          >
            <PencilSquare size={17} />
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            aria-label="Excluir treino"
            style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", color: "#dc3545" }}
          >
            <Trash size={17} />
          </button>
        </Card.Body>
      </Card>
    </div>
  );
}

function StaticWorkoutCard({ workout, onView, onDelete }) {
  return (
    <Card className="workout-card mb-2">
      <Card.Body className="d-flex align-items-center gap-2 py-2">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{workout.name}</div>
          {workout.isPublic && <span className="badge bg-info" style={{ fontSize: 10 }}>Público</span>}
        </div>
        <button
          onClick={() => onView(workout.id)}
          aria-label="Editar treino"
          style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", color: "var(--text-muted, #555)" }}
        >
          <PencilSquare size={17} />
        </button>
        <button
          onClick={() => onDelete(workout.id)}
          aria-label="Excluir treino"
          style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", color: "#dc3545" }}
        >
          <Trash size={17} />
        </button>
      </Card.Body>
    </Card>
  );
}

function MyWorkoutsPage() {
  const { signed, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fileInputRef = useRef(null);
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [userActions, setUserActions] = useState({});
  const [importing, setImporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const isPaginated = totalPages > 1;

  const loadWorkouts = async (page) => {
    try {
      setLoading(true);
      setError("");
      const data = await workoutService.getMyWorkoutsPaged(page, PAGE_SIZE);
      setWorkouts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.message || "Erro ao carregar treinos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !signed) {
      navigate("/signin");
      return;
    }

    if (signed) {
      loadWorkouts(currentPage);
    }
  }, [signed, authLoading, navigate, currentPage]);

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const handleViewWorkout = (id) => {
    navigate(`/workout/${id}`);
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este treino?")) {
      return;
    }

    try {
      await workoutService.deleteWorkout(id);
      await loadWorkouts(currentPage);
    } catch (err) {
      setError(err.message || "Erro ao deletar treino");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = workouts.findIndex(w => w.id === active.id);
    const newIndex = workouts.findIndex(w => w.id === over.id);
    const reordered = arrayMove(workouts, oldIndex, newIndex);
    setWorkouts(reordered);

    try {
      await workoutService.reorderWorkouts(reordered.map(w => w.id));
    } catch (err) {
      setWorkouts(workouts);
      setError(err.message || "Erro ao reordenar treinos");
    }
  };

  const handleExportAll = async () => {
    if (totalElements === 0) return;
    try {
      setExportingAll(true);
      const allWorkouts = await workoutService.getMyWorkouts();
      const workoutsWithExercises = await Promise.all(
        allWorkouts.map((w) => workoutService.getWorkout(w.id))
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
      await loadWorkouts(0);
      setCurrentPage(0);
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 0}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </Pagination.Item>
        );
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${i}`} disabled />);
      }
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages - 1}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">
          {totalElements} treino{totalElements !== 1 ? "s" : ""} no total
        </small>
        <Pagination size="sm" className="mb-0">{items}</Pagination>
      </div>
    );
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
              disabled={exportingAll || totalElements === 0}
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
        ) : isPaginated ? (
          <>
            {workouts.map((workout) => (
              <StaticWorkoutCard
                key={workout.id}
                workout={workout}
                onView={handleViewWorkout}
                onDelete={handleDeleteWorkout}
              />
            ))}
            {renderPagination()}
          </>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={workouts.map(w => w.id)} strategy={verticalListSortingStrategy}>
              {workouts.map((workout) => (
                <SortableWorkoutCard
                  key={workout.id}
                  workout={workout}
                  onView={handleViewWorkout}
                  onDelete={handleDeleteWorkout}
                />
              ))}
            </SortableContext>
          </DndContext>
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
