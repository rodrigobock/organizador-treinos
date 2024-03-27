import React, { useState } from 'react';
import NavBar from "../../components/NavBar";

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function NewWorkoutPage() {
  const [exercises, setExercises] = useState([{ exerciseName: '' }]);
  const [workoutName, setWorkoutName] = useState('');
  const [disableSave, setDisableSave] = useState(true);

  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseName: '' }]);
    setDisableSave(true); // Reabilitar o botão de salvar quando um novo exercício é adicionado
  };

  const handleDeleteExercise = (index) => {
    if (exercises.length > 1) {
      const newExercises = [...exercises];
      newExercises.splice(index, 1);
      setExercises(newExercises);
    } else {
      // Limpar o texto do exercício em vez de remover se houver apenas um item na lista
      const updatedExercises = [{ exerciseName: '' }];
      setExercises(updatedExercises);
    }
    setDisableSave(true); // Reabilitar o botão de salvar ao remover um exercício
  };

  const handleChangeExerciseName = (index, event) => {
    const newExercises = [...exercises];
    newExercises[index].exerciseName = event.target.value;
    setExercises(newExercises);
    setDisableSave(false); // Habilitar o botão de salvar quando o texto do exercício é alterado
  };

  const handleChangeWorkoutName = (event) => {
    setWorkoutName(event.target.value);
    setDisableSave(false); // Habilitar o botão de salvar quando o nome do treino é alterado
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aqui você pode enviar os dados do formulário para o servidor ou fazer o que for necessário
    console.log('Nome do Treino:', workoutName);
    console.log('Exercícios cadastrados:', exercises);
  };

  return (
    <>
      <NavBar />
      <div className="container">
        <h2 style={{ textAlign: 'center'}} className="my-4">Cadastro de Exercícios</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formWorkoutName">
            <Form.Label>Nome do Treino</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do treino"
              value={workoutName}
              onChange={handleChangeWorkoutName}
            />
          </Form.Group>
          <br />
          <p>Lista de Exercícios:</p>
          {exercises.map((exercise, index) => (
            <div key={index} className="form-group mb-3">
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
          <div className="fixed-bottom mb-4 mx-4">
            <div className="w-100 mb-2">
              <Button
                variant="primary"
                className="w-100"
                onClick={handleAddExercise}
              >
                Adicionar Novo Exercício
              </Button>
            </div>
            <div className="w-100">
              <Button
                type="submit"
                variant="success"
                className="w-100"
                onClick={handleSubmit}
                disabled={!workoutName || exercises.every(exercise => !exercise.exerciseName)}
              >
                Salvar
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}

export default NewWorkoutPage;
