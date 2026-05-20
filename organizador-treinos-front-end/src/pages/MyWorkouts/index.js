import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { downloadJson } from "../../utils/downloadJson";
import useAuth from "../../hooks/useAuth";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash, PencilSquare, GripVertical } from "react-bootstrap-icons";

const PAGE_SIZE = 10;

function SortableWorkoutCard({ workout, onView, onDelete, deletingId, t }) {
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
        <Card.Body className="d-flex align-items-center gap-2 py-2">
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: isDeleting ? "not-allowed" : "grab", color: "var(--text-muted, #888)", flexShrink: 0 }}
          >
            <GripVertical size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{workout.name}</div>
            {workout.isPublic && <span className="badge bg-info" style={{ fontSize: 10 }}>{t("common:public")}</span>}
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

function StaticWorkoutCard({ workout, onView, onDelete, deletingId, t }) {
  const isDeleting = deletingId === workout.id;

  return (
    <Card className="workout-card mb-2" style={{ opacity: isDeleting ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <Card.Body className="d-flex align-items-center gap-2 py-2">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{workout.name}</div>
          {workout.isPublic && <span className="badge bg-info" style={{ fontSize: 10 }}>{t("common:public")}</span>}
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
  const { signed, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("workouts");

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
      setError(t("myWorkouts.errorExporting"));
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
      setError(t("myWorkouts.invalidJson"));
      return;
    }

    if (parsed.version !== 1 || !Array.isArray(parsed.workouts)) {
      setError(t("myWorkouts.unsupportedVersion"));
      return;
    }

    if (parsed.workouts.length === 0) {
      setError(t("myWorkouts.noWorkoutsInFile"));
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
      setError(typeof err === "string" ? err : t("myWorkouts.errorAnalyzing"));
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>{t("myWorkouts.title")}</h1>
          <div className="d-flex gap-2">
            <Button
              Text={
                exportingAll ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    {t("myWorkouts.exportingJson")}
                  </span>
                ) : t("myWorkouts.exportJson")
              }
              onClick={handleExportAll}
              disabled={exportingAll || totalElements === 0}
              size="sm"
            />
            <Button
              Text={
                importing ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    {t("myWorkouts.importingJson")}
                  </span>
                ) : t("myWorkouts.importJson")
              }
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
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal show={importAnalysis !== null} onHide={() => setImportAnalysis(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("myWorkouts.import.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered hover>
            <thead>
              <tr>
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
          <Button Text={t("common:cancel")} onClick={() => setImportAnalysis(null)} />
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
