import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import templateService from "../../services/templateService";
import useAuth from "../../hooks/useAuth";

const GOAL_OPTIONS = ["HIPERTROFIA", "FORCA", "INICIANTE", "FUNCIONAL"];

function GoalBadge({ goal, t }) {
  const variantMap = {
    HIPERTROFIA: "primary",
    FORCA: "danger",
    INICIANTE: "success",
    FUNCIONAL: "warning",
  };
  return (
    <Badge bg={variantMap[goal] || "secondary"} className="me-1">
      {t(`templates.goals.${goal}`, { defaultValue: goal })}
    </Badge>
  );
}

function TemplateCard({ template, onImport, importing, signed, t }) {
  const previewExercises = template.exercises.slice(0, 4);
  const remaining = template.exercises.length - previewExercises.length;

  return (
    <Card className="mb-3 h-100" style={{ borderColor: "var(--border)" }}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <Card.Title style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 0 }}>
            {template.name}
          </Card.Title>
          <GoalBadge goal={template.goal} t={t} />
        </div>

        {template.description && (
          <Card.Text
            className="text-muted"
            style={{ fontSize: "0.85rem", lineHeight: 1.4 }}
          >
            {template.description}
          </Card.Text>
        )}

        <ul className="list-unstyled mb-3" style={{ fontSize: "0.85rem" }}>
          {previewExercises.map((exercise) => (
            <li key={exercise.id} style={{ padding: "2px 0" }}>
              <span style={{ color: "var(--text-muted)" }}>•</span>{" "}
              {exercise.name}
              {(exercise.sets || exercise.reps) && (
                <span className="text-muted ms-1">
                  {exercise.sets && `${exercise.sets}x`}
                  {exercise.reps && `${exercise.reps}`}
                </span>
              )}
            </li>
          ))}
          {remaining > 0 && (
            <li className="text-muted" style={{ fontSize: "0.8rem" }}>
              {t("templates.moreExercises", { count: remaining })}
            </li>
          )}
        </ul>

        <div className="mt-auto">
          <Button
            Text={
              importing === template.id
                ? t("templates.importing")
                : signed
                ? t("templates.useTemplate")
                : t("templates.loginToUse")
            }
            onClick={() => onImport(template.id)}
            disabled={!signed || importing !== null}
            size="sm"
          />
        </div>
      </Card.Body>
    </Card>
  );
}

function TemplatesPage() {
  const { signed, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("workouts");

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeGoal, setActiveGoal] = useState(null);
  const [importing, setImporting] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadTemplates = useCallback(async (goal) => {
    try {
      setLoading(true);
      setError("");
      const data = await templateService.getTemplates(goal || undefined);
      setTemplates(data);
    } catch (err) {
      setError(err.message || t("templates.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTemplates(activeGoal);
  }, [activeGoal, loadTemplates]);

  const handleGoalFilter = (goal) => {
    setActiveGoal((prev) => (prev === goal ? null : goal));
  };

  const handleImport = async (templateId) => {
    if (!signed) {
      navigate("/");
      return;
    }

    try {
      setImporting(templateId);
      setSuccessMessage("");
      setError("");
      await templateService.importTemplate(templateId);
      setSuccessMessage(t("templates.importSuccess"));
      setTimeout(() => navigate("/myworkouts"), 1500);
    } catch (err) {
      setError(err.message || t("templates.errorImporting"));
    } finally {
      setImporting(null);
    }
  };

  if (authLoading) {
    return (
      <>
        <NavBar />
        <div
          className="container"
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t("common:loading")}</span>
          </Spinner>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{ marginTop: "20px", marginBottom: "40px" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1>{t("templates.title")}</h1>
          {signed && (
            <Button
              Text={t("templates.myWorkouts")}
              onClick={() => navigate("/myworkouts")}
              size="sm"
            />
          )}
        </div>

        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
          {t("templates.subtitle")}
        </p>

        <div className="d-flex gap-2 flex-wrap mb-4">
          <button
            className={`btn btn-sm ${activeGoal === null ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setActiveGoal(null)}
          >
            {t("templates.allGoals")}
          </button>
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              className={`btn btn-sm ${activeGoal === goal ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => handleGoalFilter(goal)}
            >
              {t(`templates.goals.${goal}`, { defaultValue: goal })}
            </button>
          ))}
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!signed && (
          <div className="alert alert-info mb-4" role="alert">
            {t("templates.loginPrompt")}
          </div>
        )}

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <Spinner animation="border" role="status">
              <span className="visually-hidden">{t("common:loading")}</span>
            </Spinner>
          </div>
        ) : templates.length === 0 ? (
          <Card className="text-center">
            <Card.Body style={{ padding: "60px 20px" }}>
              <Card.Title>{t("templates.noTemplates")}</Card.Title>
            </Card.Body>
          </Card>
        ) : (
          <div className="row g-3">
            {templates.map((template) => (
              <div key={template.id} className="col-12 col-md-6 col-lg-4">
                <TemplateCard
                  template={template}
                  onImport={handleImport}
                  importing={importing}
                  signed={signed}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TemplatesPage;
