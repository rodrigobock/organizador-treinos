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

const CATEGORY_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "FUNCTIONAL", "CALISTHENICS"];

const CATEGORY_VARIANT = {
  BEGINNER: "success",
  INTERMEDIATE: "primary",
  ADVANCED: "danger",
  FUNCTIONAL: "warning",
  CALISTHENICS: "info",
};

function CategoryBadge({ category, t }) {
  return (
    <Badge bg={CATEGORY_VARIANT[category] || "secondary"} className="me-1">
      {t(`templates.categories.${category}`, { defaultValue: category })}
    </Badge>
  );
}

function GenderBadge({ gender, t }) {
  if (!gender || gender === "UNISEX") return null;
  return (
    <Badge bg="secondary" className="me-1" style={{ fontSize: "0.75rem" }}>
      {t(`templates.genders.${gender}`, { defaultValue: gender })}
    </Badge>
  );
}

function TemplateCard({ template, onImport, importing, signed, t }) {
  const previewExercises = template.exercises.slice(0, 4);
  const remaining = template.exercises.length - previewExercises.length;

  return (
    <Card className="mb-3 h-100" style={{ borderColor: "var(--border)" }}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
          <Card.Title style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 0 }}>
            {template.name}
          </Card.Title>
          <div style={{ flexShrink: 0 }}>
            <CategoryBadge category={template.category} t={t} />
            <GenderBadge gender={template.gender} t={t} />
          </div>
        </div>

        {template.description && (
          <Card.Text style={{ fontSize: "0.85rem", lineHeight: 1.4, color: "var(--text-muted)" }}>
            {template.description}
          </Card.Text>
        )}

        <ul className="list-unstyled mb-3" style={{ fontSize: "0.85rem" }}>
          {previewExercises.map((exercise) => (
            <li key={exercise.id} style={{ padding: "2px 0", color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>•</span>{" "}
              {exercise.name}
              {(exercise.sets || exercise.reps) && (
                <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
                  {exercise.sets && `${exercise.sets}x`}
                  {exercise.reps && `${exercise.reps}`}
                </span>
              )}
            </li>
          ))}
          {remaining > 0 && (
            <li style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
  const { signed, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("workouts");

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [importing, setImporting] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const userGender = signed && user?.gender && user.gender !== "UNISEX" ? user.gender : null;

  const loadTemplates = useCallback(async (category) => {
    try {
      setLoading(true);
      setError("");
      const data = await templateService.getTemplates(category || undefined, userGender || undefined);
      setTemplates(data);
    } catch (err) {
      setError(err.message || t("templates.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t, userGender]);

  useEffect(() => {
    loadTemplates(activeCategory);
  }, [activeCategory, loadTemplates]);

  const handleCategoryFilter = (category) => {
    setActiveCategory((prev) => (prev === category ? null : category));
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
        <div className="container" style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
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
            <Button Text={t("templates.myWorkouts")} onClick={() => navigate("/myworkouts")} size="sm" />
          )}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {t("templates.subtitle")}
        </p>

        <div className="d-flex gap-2 flex-wrap mb-4">
          <button
            className={`btn btn-sm ${activeCategory === null ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setActiveCategory(null)}
          >
            {t("templates.allCategories")}
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${activeCategory === cat ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => handleCategoryFilter(cat)}
            >
              {t(`templates.categories.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!signed && (
          <div className="alert alert-info mb-4">{t("templates.loginPrompt")}</div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
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
