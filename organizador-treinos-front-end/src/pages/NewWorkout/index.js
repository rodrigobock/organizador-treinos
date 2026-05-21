import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from "../../components/NavBar";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Trash } from 'react-bootstrap-icons';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';
import './styles.css';

const EXERCISE_SUGGESTIONS = [
  'Supino Reto', 'Supino Inclinado', 'Supino Declinado',
  'Rosca Direta', 'Rosca Alternada', 'Rosca Martelo', 'Rosca Scott',
  'Tríceps Pulley', 'Tríceps Testa', 'Tríceps Corda', 'Tríceps Francês',
  'Desenvolvimento com Halter', 'Desenvolvimento com Barra', 'Desenvolvimento Arnold',
  'Elevação Lateral', 'Elevação Frontal', 'Elevação Posterior',
  'Remada Curvada', 'Remada Unilateral', 'Remada Cavalinho', 'Remada T',
  'Puxada Frontal', 'Puxada Supinada', 'Puxada Neutra',
  'Leg Press', 'Leg Press 45°', 'Agachamento', 'Agachamento Livre', 'Agachamento Goblet',
  'Cadeira Extensora', 'Mesa Flexora', 'Cadeira Abdutora', 'Cadeira Adutora',
  'Stiff', 'Bom Dia', 'Elevação Pélvica', 'Levantamento Terra',
  'Panturrilha em Pé', 'Panturrilha Sentado', 'Panturrilha no Leg Press',
  'Abdominal Crunch', 'Abdominal Bicicleta', 'Prancha',
  'Flexão de Braços', 'Barra Fixa', 'Barra Fixa Supinada', 'Paralelas',
  'Corrida na Esteira', 'Bicicleta Ergométrica', 'Elíptico',
  'Crucifixo', 'Crucifixo Inclinado', 'Fly na Polia', 'Peck Deck',
  'Pullover', 'Afundo', 'Glúteo no Cabo', 'Extensão de Quadril',
];

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

          <datalist id="exercise-suggestions">
            {EXERCISE_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="mb-3">
            <Form.Label>{t('newWorkout.exercisesLabel')}</Form.Label>
            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-row mb-2 p-2 border rounded">
                <Form.Control
                  className="exercise-name-field"
                  type="text"
                  list="exercise-suggestions"
                  value={exercise.exerciseName}
                  placeholder={t('newWorkout.exerciseNamePlaceholder')}
                  onChange={(e) => handleChangeExerciseField(index, 'exerciseName', e.target.value)}
                  disabled={loading}
                  maxLength={255}
                />
                <div className="exercise-num-fields">
                  <Form.Control
                    size="sm"
                    type="number" min="1"
                    placeholder={t('newWorkout.setsPlaceholder')}
                    value={exercise.sets}
                    onChange={(e) => handleChangeExerciseField(index, 'sets', e.target.value)}
                    disabled={loading}
                  />
                  <Form.Control
                    size="sm"
                    type="number" min="1"
                    placeholder={t('newWorkout.repsMinPlaceholder')}
                    value={exercise.repsMin}
                    onChange={(e) => handleChangeExerciseField(index, 'repsMin', e.target.value)}
                    disabled={loading}
                  />
                  <Form.Control
                    size="sm"
                    type="number" min="1"
                    placeholder={t('newWorkout.repsMaxPlaceholder')}
                    value={exercise.repsMax}
                    onChange={(e) => handleChangeExerciseField(index, 'repsMax', e.target.value)}
                    disabled={loading}
                  />
                  <Form.Control
                    size="sm"
                    type="number" min="0" step="0.5"
                    placeholder={t('newWorkout.weightPlaceholder')}
                    value={exercise.weight}
                    onChange={(e) => handleChangeExerciseField(index, 'weight', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  className="exercise-trash"
                  onClick={() => handleDeleteExercise(index)}
                  disabled={loading}
                  aria-label={t('newWorkout.removeExercise')}
                >
                  <Trash size={16} />
                </button>
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
