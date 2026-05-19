import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from "../../components/NavBar";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';

function NewWorkoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('workouts');

  const [exercises, setExercises] = useState([{ exerciseName: '' }]);
  const [workoutName, setWorkoutName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseName: '' }]);
  };

  const handleDeleteExercise = (index) => {
    if (exercises.length > 1) {
      const newExercises = [...exercises];
      newExercises.splice(index, 1);
      setExercises(newExercises);
    } else {
      const updatedExercises = [{ exerciseName: '' }];
      setExercises(updatedExercises);
    }
  };

  const handleChangeExerciseName = (index, event) => {
    const newExercises = [...exercises];
    newExercises[index].exerciseName = event.target.value;
    setExercises(newExercises);
  };

  const handleChangeWorkoutName = (event) => {
    setWorkoutName(event.target.value);
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
      const workoutResponse = await workoutService.createWorkout(workoutName, isPublic);

      for (const exercise of validExercises) {
        await exerciseService.createExercise(workoutResponse.id, exercise.exerciseName);
      }

      navigate('/myworkouts');
    } catch (err) {
      setError(err.message || t('newWorkout.errorCreating'));
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
              onChange={handleChangeWorkoutName}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group controlId="formIsPublic" className="mb-3">
            <Form.Check
              type="checkbox"
              label={t('newWorkout.publicCheckbox')}
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
            />
          </Form.Group>

          <div className="mb-3">
            <Form.Label>{t('newWorkout.exercisesLabel')}</Form.Label>
            {exercises.map((exercise, index) => (
              <div key={index} className="mb-2">
                <Row>
                  <Col xs={9} sm={9}>
                    <Form.Control
                      type="text"
                      value={exercise.exerciseName}
                      placeholder={t('newWorkout.exerciseNamePlaceholder')}
                      onChange={(event) => handleChangeExerciseName(index, event)}
                      disabled={loading}
                    />
                  </Col>
                  <Col xs={3} sm={3}>
                    <Button
                      variant="danger"
                      className="w-100"
                      onClick={() => handleDeleteExercise(index)}
                      disabled={loading}
                    >
                      {t('newWorkout.removeExercise')}
                    </Button>
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
