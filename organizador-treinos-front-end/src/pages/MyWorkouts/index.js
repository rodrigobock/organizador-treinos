import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import Spinner from "react-bootstrap/Spinner";
import workoutService from "../../services/workoutService";
import useAuth from "../../hooks/useAuth";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash, PencilSquare, GripVertical } from "react-bootstrap-icons";

const PAGE_SIZE = 10;

function SortableWorkoutCard({ workout, onView, onDelete, deletingId, user, t }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: workout.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDeleting = deletingId === workout.id;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="workout-card mb-2" style={{ opacity: isDeleting ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <Card.Body className="d-flex align-items-center gap-2 py-3">
          <span
            {...attributes}
            {...listeners}
            style={{
              cursor: isDeleting ? "not-allowed" : "grab",
              padding: "4px 6px",
              color: "var(--text-muted)",
              borderRadius: 4,
              transition: "background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <GripVertical size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{workout.name}</div>
            {workout.exercises != null && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {workout.exercises.length || 0} {workout.exercises.length === 1 ? t("myWorkouts.exerciseSingular", "exercicio") : t("myWorkouts.exercisePlural", "exercicios")}
              </div>
            )}
            {workout.isPublic && <span className="badge bg-info me-1" style={{ fontSize: 10 }}>{t("common:public")}</span>}
            {user && workout.userId !== user.id && <span className="badge bg-secondary" style={{ fontSize: 10 }}>{t("myWorkouts.sharedBy", { name: workout.ownerName })}</span>}
          </div>
          <button
            onClick={() => onView(workout.id)}
            aria-label={t("myWorkouts.editWorkout")}
            disabled={isDeleting}
            style={{ background: "none", border: "none", padding: "4px 6px", cursor: isDeleting ? "not-allowed" : "pointer", color: "var(--text-muted, #555)" }}
          >
            <PencilSquare size={17} />
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            aria-label={t("myWorkouts.deleteWorkout")}
            disabled={isDeleting}
            style={{ background: "none", border: "none", padding: "4px 6px", cursor: isDeleting ? "not-allowed" : "pointer", color: "#dc3545" }}
          >
            {isDeleting ? (
              <Spinner animation="border" size="sm" role="status" style={{ width: 17, height: 17 }}>
                <span className="visually-hidden">{t("myWorkouts.deleting")}</span>
              </Spinner>
            ) : (
              <Trash size={17} />
            )}
          </button>
        </Card.Body>
      </Card>
    </div>
  );
}


function StaticWorkoutCard({ workout, onView, onDelete, deletingId, user, t }) {
  const isDeleting = deletingId === workout.id;

  return (
    <Card className="workout-card mb-2" style={{ opacity: isDeleting ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <Card.Body className="d-flex align-items-center gap-2 py-3">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{workout.name}</div>
          {workout.exercises != null && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {workout.exercises.length || 0} {workout.exercises.length === 1 ? t("myWorkouts.exerciseSingular", "exercicio") : t("myWorkouts.exercisePlural", "exercicios")}
            </div>
          )}
          {workout.isPublic && <span className="badge bg-info me-1" style={{ fontSize: 10 }}>{t("common:public")}</span>}
          {user && workout.userId !== user.id && <span className="badge bg-secondary" style={{ fontSize: 10 }}>{t("myWorkouts.sharedBy", { name: workout.ownerName })}</span>}
        </div>
        <button
          onClick={() => onView(workout.id)}
          aria-label={t("myWorkouts.editWorkout")}
          disabled={isDeleting}
          style={{ background: "none", border: "none", padding: "4px 6px", cursor: isDeleting ? "not-allowed" : "pointer", color: "var(--text-muted, #555)" }}
        >
          <PencilSquare size={17} />
        </button>
        <button
          onClick={() => onDelete(workout.id)}
          aria-label={t("myWorkouts.deleteWorkout")}
          disabled={isDeleting}
          style={{ background: "none", border: "none", padding: "4px 6px", cursor: isDeleting ? "not-allowed" : "pointer", color: "#dc3545" }}
        >
          {isDeleting ? (
            <Spinner animation="border" size="sm" role="status" style={{ width: 17, height: 17 }}>
              <span className="visually-hidden">{t("myWorkouts.deleting")}</span>
            </Spinner>
          ) : (
            <Trash size={17} />
          )}
        </button>
      </Card.Body>
    </Card>
  );
}

function MyWorkoutsPage() {
  const { signed, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("workouts");

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [importAnalysis, setImportAnalysis] = useState(null);
  const [userActions, setUserActions] = useState({});
  const [importing, setImporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const isPaginated = totalPages > 1;

  const loadWorkouts = useCallback(async (page) => {
    try {
      setLoading(true);
      setError("");
      const data = await workoutService.getMyWorkoutsPaged(page, PAGE_SIZE);
      setWorkouts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("myWorkouts.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && !signed) {
      navigate("/signin");
      return;
    }

    if (signed) {
      loadWorkouts(currentPage);
    }
  }, [signed, authLoading, navigate, currentPage, loadWorkouts]);

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const handleViewWorkout = (id) => {
    navigate(`/workout/${id}`);
  };

  const handleDeleteWorkout = async (id) => {
    if (deletingId) return;
    if (!window.confirm(t("myWorkouts.confirmDelete"))) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      await workoutService.deleteWorkout(id);
      await loadWorkouts(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("myWorkouts.errorDeleting"));
    } finally {
      setDeletingId(null);
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
      setError(err.response?.data?.message || err.message || t("myWorkouts.errorReordering"));
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
      if (result.created > 0) parts.push(t("myWorkouts.import.resultCreated", { count: result.created }));
      if (result.replaced > 0) parts.push(t("myWorkouts.import.resultReplaced", { count: result.replaced }));
      if (result.skipped > 0) parts.push(t("myWorkouts.import.resultSkipped", { count: result.skipped }));
      alert(t("myWorkouts.import.resultTitle", { details: parts.join(", ") }));
    } catch (err) {
      setError(typeof err === "string" ? err : t("myWorkouts.errorImporting"));
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
          {totalElements === 1
            ? t("myWorkouts.totalCount", { count: totalElements })
            : t("myWorkouts.totalCount_plural", { count: totalElements })}
        </small>
        <Pagination size="sm" className="mb-0">{items}</Pagination>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <div className="container" style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t("myWorkouts.loadingWorkouts")}</span>
          </Spinner>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{ marginTop: "20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t("myWorkouts.title")}</h1>
          <div className="d-flex gap-2">
            <Button
              Text={t("myWorkouts.newWorkout")}
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
          <Card className="text-center">
            <Card.Body style={{ padding: "60px 20px" }}>
              <Card.Title className="mb-3">{t("myWorkouts.emptyMessage")}</Card.Title>
              <Card.Text className="text-muted mb-4">
                {t("myWorkouts.emptyMessage")}
              </Card.Text>
              <Button
                Text={t("myWorkouts.emptyButton")}
                onClick={() => navigate("/newworkout")}
              />
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
                deletingId={deletingId}
                user={user}
                t={t}
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
                  deletingId={deletingId}
                  user={user}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        </div>
      </div>

      <Modal show={importAnalysis !== null} onHide={() => setImportAnalysis(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("myWorkouts.import.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered hover style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                <th>{t("myWorkouts.import.workoutColumn")}</th>
                <th>{t("myWorkouts.import.exercisesColumn")}</th>
                <th>{t("myWorkouts.import.statusColumn")}</th>
                <th>{t("myWorkouts.import.actionColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {(importAnalysis || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.workout.name}</td>
                  <td>{t("myWorkouts.import.exerciseCount", { count: (item.workout.exercises || []).length })}</td>
                  <td>
                    {item.status === "clean" ? (
                      <span className="badge bg-success">{t("myWorkouts.import.statusNew")}</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        {t("myWorkouts.import.statusDuplicate", { percent: Math.round(item.similarity * 100) })}
                      </span>
                    )}
                  </td>
                  <td>
                    {item.status === "clean" ? (
                      <span className="text-muted">{t("myWorkouts.import.willBeCreated")}</span>
                    ) : (
                      <Form.Select
                        size="sm"
                        value={userActions[idx] || "skip"}
                        onChange={(e) =>
                          setUserActions({ ...userActions, [idx]: e.target.value })
                        }
                      >
                        <option value="create">{t("myWorkouts.import.createDuplicate")}</option>
                        <option value="replace">{t("myWorkouts.import.replace")}</option>
                        <option value="skip">{t("myWorkouts.import.skip")}</option>
                      </Form.Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            onClick={() => setImportAnalysis(null)}
            style={{
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'Outfit', -apple-system, sans-serif",
              transition: "opacity 0.15s",
            }}
          >
            {t("common:cancel")}
          </button>
          <Button
            Text={
              importing ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  {t("myWorkouts.import.confirmingButton")}
                </span>
              ) : t("myWorkouts.import.confirmButton")
            }
            onClick={handleConfirmImport}
            disabled={importing}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MyWorkoutsPage;
