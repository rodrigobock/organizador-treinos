import NavBar from "../../components/NavBar";
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import * as C from "../Signin/styles";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function HomePage() {
  // Estado inicial para os checkboxes
  const [checkboxes, setCheckboxes] = useState({
    item1: false,
    item2: false,
    item3: false,
    item4: false,
    item5: false,
    item6: false,
    item7: false,
    item8: false,
    item9: false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({ ...checkboxes, [name]: checked });
  };

  return (
    <>
      <NavBar />
      <C.ContainerCabecalhoMobile>
        <h3 style={{ marginTop: '20px' }}>Bem vindo(a)!</h3>
        <h5>Esse é o seu treino do dia:</h5>
      </C.ContainerCabecalhoMobile>
      <Card style={{ marginTop: '20px' }}>
        <Card.Body>
          <Card.Title>Treino de ombros e biceps</Card.Title>
          <Form>
            <Form.Check
              type="checkbox"
              id="item1"
              label="Pulldown Hummer"
              name="item1"
              checked={checkboxes.item1}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item2"
              label="Remada Baixa"
              name="item2"
              checked={checkboxes.item2}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item3"
              label="Remada Curvada Maquina Neutra"
              name="item3"
              checked={checkboxes.item3}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item4"
              label="Puxada Aberta"
              name="item4"
              checked={checkboxes.item4}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item5"
              label="Rosca Direta Cross"
              name="item5"
              checked={checkboxes.item5}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item6"
              label="Rosca 21 com barra"
              name="item5"
              checked={checkboxes.item6}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item7"
              label="Desenvolvimento Barra"
              name="item7"
              checked={checkboxes.item7}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item7"
              label="Desenvolvimento Barra"
              name="item7"
              checked={checkboxes.item7}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item8"
              label="Elevação Frontal Halter"
              name="item8"
              checked={checkboxes.item8}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="item9"
              label="Abdominal Supra"
              name="item9"
              checked={checkboxes.item9}
              onChange={handleCheckboxChange}
            />
            {/* Adicione mais checkboxes conforme necessário */}

            <br></br>
            
            <Row className="justify-content-center">
              <Col xs={12}>
                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                  Finalizar Treino
                </Button>
              </Col>
            </Row>

          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

export default HomePage;
