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

const CATEGORY_OPTIONS = [
  "BEGINNER", "INTERMEDIATE", "ADVANCED",
  "HYPERTROPHY", "STRENGTH", "CARDIO",
  "FUNCTIONAL", "CALISTHENICS", "MOBILITY",
];

const MUSCLE_GROUP_OPTIONS = [
  "FULL_BODY", "UPPER_BODY", "LOWER_BODY",
  "CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "GLUTES", "CORE",
];

const EQUIPMENT_OPTIONS = [
  "BODYWEIGHT", "DUMBBELLS", "RESISTANCE_BANDS",
  "BARBELL", "MACHINES", "KETTLEBELL", "FULL_GYM",
];

const CATEGORY_VARIANT = {
  BEGINNER: "success",
  INTERMEDIATE: "primary",
  ADVANCED: "danger",
  FUNCTIONAL: "warning",
  CALISTHENICS: "info",
  HYPERTROPHY: "danger",
  STRENGTH: "dark",
  CARDIO: "warning",
  MOBILITY: "secondary",
};

const ACTIVE_STYLE = {
  background: "var(--accent)",
  color: "var(--btn-primary-text, #000)",
  border: "1px solid var(--accent)",
  borderRadius: 6,
  fontWeight: 600,
};

const INACTIVE_STYLE = {
  background: "transparent",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: 6,
};

function FilterButton({ label, active, onClick }) {
  return (
    <button
      className="btn btn-sm"
      onClick={onClick}
      style={active ? ACTIVE_STYLE : INACTIVE_STYLE}
    >
      {label}
    </button>
  );
}

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
  return (
    <Card className="mb-3 h-100" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
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

        <div className="d-flex gap-3 mb-2" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {template.estimatedDuration && (
            <span>⏱ {template.estimatedDuration} min</span>
          )}
          {template.weeklyFrequency && (
            <span>📅 {template.weeklyFrequency}x/sem</span>
          )}
          {template.equipmentRequired && (
            <span>🏋️ {t(`templates.equipment.${template.equipmentRequired}`, { defaultValue: template.equipmentRequired })}</span>
          )}
        </div>

        <ul className="list-unstyled mb-3" style={{ fontSize: "0.85rem" }}>
          {template.exercises.map((exercise, idx) => (
            <li key={exercise.id} style={{ padding: "2px 0", color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)", minWidth: 16, display: "inline-block" }}>{idx + 1}.</span>{" "}
              {exercise.name}
              {(exercise.sets || exercise.reps) && (
                <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
                  {exercise.sets && `${exercise.sets}x`}
                  {exercise.reps && `${exercise.reps}`}
                </span>
              )}
            </li>
          ))}
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

function FilterSection({ label, children }) {
  return (
    <div className="mb-3">
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginRight: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <div className="d-flex gap-2 flex-wrap mt-1">
        {children}
      </div>
    </div>
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
  const [activeGender, setActiveGender] = useState(null);
  const [activeMuscleGroup, setActiveMuscleGroup] = useState(null);
  const [activeEquipment, setActiveEquipment] = useState(null);
  const [importing, setImporting] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const autoGender = signed && user?.gender && user.gender !== "UNISEX" ? user.gender : null;
  const resolvedGender = activeGender === "ALL" ? null : (activeGender || autoGender);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await templateService.getTemplates(
        activeCategory || undefined,
        resolvedGender || undefined,
        activeMuscleGroup || undefined,
        activeEquipment || undefined
      );
      setTemplates(data);
    } catch (err) {
      setError(err.message || t("templates.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [activeCategory, resolvedGender, activeMuscleGroup, activeEquipment, t]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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
      setTimeout(() => navigate("/myworkouts"), 2500);
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
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t("templates.title")}</h1>
            {signed && (
              <Button Text={t("templates.myWorkouts")} onClick={() => navigate("/myworkouts")} size="sm" />
            )}
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {t("templates.subtitle")}
          </p>

          <FilterSection label={t("templates.filterCategory")}>
            <FilterButton
              label={t("templates.allCategories")}
              active={activeCategory === null}
              onClick={() => setActiveCategory(null)}
            />
            {CATEGORY_OPTIONS.map((cat) => (
              <FilterButton
                key={cat}
                label={t(`templates.categories.${cat}`, { defaultValue: cat })}
                active={activeCategory === cat}
                onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
              />
            ))}
          </FilterSection>

          <FilterSection label={t("templates.filterGender")}>
            <FilterButton
              label={t("templates.allGenders")}
              active={activeGender === "ALL" || (activeGender === null && !autoGender)}
              onClick={() => setActiveGender("ALL")}
            />
            <FilterButton
              label={t("templates.genders.MALE")}
              active={activeGender === "MALE"}
              onClick={() => setActiveGender((prev) => (prev === "MALE" ? null : "MALE"))}
            />
            <FilterButton
              label={t("templates.genders.FEMALE")}
              active={activeGender === "FEMALE"}
              onClick={() => setActiveGender((prev) => (prev === "FEMALE" ? null : "FEMALE"))}
            />
          </FilterSection>

          <div className="d-flex gap-3 flex-wrap mb-4">
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                {t("templates.filterMuscle")}
              </label>
              <select
                className="form-select form-select-sm"
                style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                value={activeMuscleGroup || ""}
                onChange={(e) => setActiveMuscleGroup(e.target.value || null)}
              >
                <option value="">{t("templates.allMuscles")}</option>
                {MUSCLE_GROUP_OPTIONS.map((mg) => (
                  <option key={mg} value={mg}>
                    {t(`templates.muscleGroups.${mg}`, { defaultValue: mg })}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                {t("templates.filterEquipment")}
              </label>
              <select
                className="form-select form-select-sm"
                style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                value={activeEquipment || ""}
                onChange={(e) => setActiveEquipment(e.target.value || null)}
              >
                <option value="">{t("templates.allEquipment")}</option>
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq} value={eq}>
                    {t(`templates.equipment.${eq}`, { defaultValue: eq })}
                  </option>
                ))}
              </select>
            </div>
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
      </div>
    </>
  );
}

export default TemplatesPage;
