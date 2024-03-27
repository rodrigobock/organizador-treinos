import React, { useState } from 'react';
import NavBar from "../../components/NavBar";

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

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
    <>
      <NavBar />
      <div className="container">
        <h2 className="my-4">Cadastro de Exercícios para Treino</h2>
        <Form onSubmit={handleSubmit}>
          {exercises.map((exercise, index) => (
            <div key={index} className="form-group">
              <Row>
                <Col xs={9} sm={9}>
                  <Form.Control
                    type="text"
                    value={exercise.exerciseName}
                    placeholder="Nome do exercício"
                    onChange={(event) => handleChangeExerciseName(index, event)}
                  />
                </Col>
                <Col xs={3} sm={3}>
                  <Button variant="danger" style={{ width: '100%' }} onClick={() => handleDeleteExercise(index)}>
                    Excluir
                  </Button>
                </Col>
              </Row>
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
        </Form>
      </div>
    </>
  );
}

export default NewWorkoutPage;
