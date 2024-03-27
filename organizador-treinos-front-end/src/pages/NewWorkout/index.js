import React, { useState } from 'react';
import NavBar from "../../components/NavBar";

function NewWorkoutPage() {
  const [exercises, setExercises] = useState([{ exerciseName: '' }]);

  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseName: '' }]);
  };

  const handleDeleteExercise = (index) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleChangeExerciseName = (index, event) => {
    const newExercises = [...exercises];
    newExercises[index].exerciseName = event.target.value;
    setExercises(newExercises);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aqui você pode enviar os dados do formulário para o servidor ou fazer o que for necessário
    console.log('Exercícios cadastrados:', exercises);
  };

  return (
    <><NavBar /><div className="container">
      <h2 className="my-4">Cadastro de Exercícios para Treino</h2>
      <form onSubmit={handleSubmit}>
        {exercises.map((exercise, index) => (
          <div key={index} className="form-group d-flex align-items-center">
            <input
              type="text"
              className="form-control mb-2 mr-2"
              placeholder="Nome do exercício"
              value={exercise.exerciseName}
              onChange={(event) => handleChangeExerciseName(index, event)} />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleDeleteExercise(index)}
            >
              Excluir
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary mr-2"
          onClick={handleAddExercise}
        >
          Adicionar Novo Exercício
        </button>
        <button type="submit" className="btn btn-success">
          Salvar
        </button>
      </form>
    </div></>
  );
}

export default NewWorkoutPage;
