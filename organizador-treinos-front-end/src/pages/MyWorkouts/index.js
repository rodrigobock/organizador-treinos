import NavBar from "../../components/NavBar";
import Card from 'react-bootstrap/Card';

function MyWorkoutPage() {
  return (
    <>
      <NavBar />
      <Card style={{ marginTop: '20px' }}>
        <Card.Body>
          <Card.Title>Treino de ombros e bíceps</Card.Title>
          <ol>
            <li>Pulldown Hummer</li>
            <li>Remada Baixa</li>
            <li>Remada Curvada Máquina Neutra</li>
            <li>Puxada Aberta</li>
            <li>Rosca Direta Cross</li>
            <li>Rosca 21 com barra</li>
            <li>Desenvolvimento Barra</li>
            <li>Elevação Frontal Halter</li>
            <li>Abdominal Supra</li>
          </ol>
        </Card.Body>
      </Card>
    </>
  );
}

export default MyWorkoutPage;
