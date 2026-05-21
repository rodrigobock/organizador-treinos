import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from "../../components/NavBar";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Trash } from 'react-bootstrap-icons';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';

const emptyExercise = () => ({ exerciseName: '', sets: '', repsMin: '', repsMax: '', weight: '' });

function NewWorkoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('workouts');

  const [exercises, setExercises] = useState([emptyExercise()]);
  const [workoutName, setWorkoutName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddExercise = () => {
    setExercises([...exercises, emptyExercise()]);
  };

  const handleDeleteExercise = (index) => {
    if (exercises.length > 1) {
      const newExercises = [...exercises];
      newExercises.splice(index, 1);
      setExercises(newExercises);
    } else {
      setExercises([emptyExercise()]);
    }
  };

  const handleChangeExerciseField = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!workoutName.trim()) {
      setError(t('newWorkout.nameRequired'));
      return;
    }

    const validExercises = exercises.filter(ex => ex.exerciseName.trim());
    if (validExercises.length === 0) {
      setError(t('newWorkout.addAtLeastOne'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workoutResponse = await workoutService.createWorkout(workoutName);

      for (const exercise of validExercises) {
        await exerciseService.createExercise(
          workoutResponse.id,
          exercise.exerciseName,
          exercise.sets || null,
          exercise.repsMin || null,
          exercise.repsMax || null,
          exercise.weight || null,
        );
      }

      navigate('/myworkouts');
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('newWorkout.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container" style={{ marginTop: "20px" }}>
        <h2 className="mb-4">{t('newWorkout.title')}</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formWorkoutName" className="mb-3">
            <Form.Label>{t('newWorkout.workoutNameLabel')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('newWorkout.workoutNamePlaceholder')}
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              disabled={loading}
              maxLength={255}
            />
          </Form.Group>

          <div className="mb-3">
            <Form.Label>{t('newWorkout.exercisesLabel')}</Form.Label>
            {exercises.map((exercise, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <Row className="align-items-center mb-2">
                  <Col>
                    <Form.Control
                      type="text"
                      value={exercise.exerciseName}
                      placeholder={t('newWorkout.exerciseNamePlaceholder')}
                      onChange={(e) => handleChangeExerciseField(index, 'exerciseName', e.target.value)}
                      disabled={loading}
                      maxLength={255}
                    />
                  </Col>
                  <Col xs="auto">
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(index)}
                      disabled={loading}
                      aria-label={t('newWorkout.removeExercise')}
                      style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#dc3545" }}
                    >
                      <Trash size={16} />
                    </button>
                  </Col>
                </Row>
                <Row className="g-2">
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t('workoutDetail.setsPlaceholder')}
                      value={exercise.sets}
                      onChange={(e) => handleChangeExerciseField(index, 'sets', e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t('workoutDetail.repsMinPlaceholder')}
                      value={exercise.repsMin}
                      onChange={(e) => handleChangeExerciseField(index, 'repsMin', e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="1" size="sm"
                      placeholder={t('workoutDetail.repsMaxPlaceholder')}
                      value={exercise.repsMax}
                      onChange={(e) => handleChangeExerciseField(index, 'repsMax', e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="number" min="0" step="0.5" size="sm"
                      placeholder={t('workoutDetail.weightPlaceholder')}
                      value={exercise.weight}
                      onChange={(e) => handleChangeExerciseField(index, 'weight', e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 mb-5">
            <Button
              variant="secondary"
              onClick={handleAddExercise}
              disabled={loading}
            >
              {t('newWorkout.addExercise')}
            </Button>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="success"
              type="submit"
              className="flex-grow-1"
              disabled={loading || !workoutName.trim() || exercises.every(ex => !ex.exerciseName.trim())}
            >
              {loading ? t('newWorkout.saving') : t('newWorkout.saveWorkout')}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/myworkouts')}
              disabled={loading}
            >
              {t('newWorkout.cancel')}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default NewWorkoutPage;
