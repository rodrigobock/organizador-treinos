import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import workoutService from "../../services/workoutService";
import useAuth from "../../hooks/useAuth";

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SharedByMePage() {
  const navigate = useNavigate();
  const { signed } = useAuth();
  const { t } = useTranslation("workouts");

  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingKey, setRevokingKey] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await workoutService.getSharedByMe();
      setSharedItems(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("sharedByMe.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!signed) {
      navigate("/signin");
      return;
    }
    loadData();
  }, [signed, navigate, loadData]);

  const handleRevoke = async (workoutId, userId, userEmail) => {
    if (!window.confirm(t("sharedByMe.confirmRevoke", { email: userEmail }))) return;

    const key = `${workoutId}-${userId}`;
    try {
      setRevokingKey(key);
      await workoutService.revokeShare(workoutId, userId);
      setSharedItems(prev =>
        prev
          .map(item => {
            if (item.workoutId !== workoutId) return item;
            const remaining = item.shares.filter(s => s.userId !== userId);
            return { ...item, shares: remaining };
          })
          .filter(item => item.shares.length > 0)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("sharedByMe.errorRevoking"));
    } finally {
      setRevokingKey(null);
    }
  };

  const allExercisesCompleted = (exercises) => {
    if (!exercises || exercises.length === 0) return false;
    return exercises.every(e => e.completed);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div
          className="container"
          style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t("sharedByMe.loading")}</span>
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
          <h1>{t("sharedByMe.title")}</h1>
          <Button
            Text={t("sharedByMe.back")}
            onClick={() => navigate("/myworkouts")}
            size="sm"
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {sharedItems.length === 0 ? (
          <Card className="text-center">
            <Card.Body style={{ padding: "60px 20px" }}>
              <Card.Title className="mb-3">{t("sharedByMe.emptyTitle")}</Card.Title>
              <Card.Text className="text-muted mb-4">
                {t("sharedByMe.emptyDescription")}
              </Card.Text>
              <Button
                Text={t("sharedByMe.goToWorkouts")}
                onClick={() => navigate("/myworkouts")}
              />
            </Card.Body>
          </Card>
        ) : (
          sharedItems.map(item => (
            <Card key={item.workoutId} className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">
                  <a
                    href={`/workout/${item.workoutId}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {item.workoutName}
                  </a>
                </Card.Title>
                <Badge bg="secondary">
                  {t("sharedByMe.peopleCount", { count: item.shares.length })}
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>{t("sharedByMe.colPerson")}</th>
                      <th>{t("sharedByMe.colPermission")}</th>
                      <th>{t("sharedByMe.colSharedAt")}</th>
                      <th>{t("sharedByMe.colLastAccess")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.shares.map(share => {
                      const revokeKey = `${item.workoutId}-${share.userId}`;
                      return (
                        <tr key={share.userId}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{share.name}</div>
                            <small className="text-muted">{share.email}</small>
                          </td>
                          <td>
                            <Badge bg={share.permission === "EDIT" ? "warning" : "info"} text="dark">
                              {share.permission === "EDIT"
                                ? t("sharedByMe.permissionEdit")
                                : t("sharedByMe.permissionRead")}
                            </Badge>
                          </td>
                          <td>
                            <small>{formatDate(share.sharedAt)}</small>
                          </td>
                          <td>
                            <small>
                              {share.lastAccessedAt
                                ? formatDate(share.lastAccessedAt)
                                : <span className="text-muted">{t("sharedByMe.neverAccessed")}</span>
                              }
                            </small>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRevoke(item.workoutId, share.userId, share.email)}
                              disabled={revokingKey === revokeKey}
                            >
                              {revokingKey === revokeKey
                                ? t("sharedByMe.revoking")
                                : t("sharedByMe.revoke")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default SharedByMePage;
