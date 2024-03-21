import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import NavBar from "../../components/NavBar";
import * as C from "../Signin/styles";

function AccountPage() {
  // Verifica se a tela é de um dispositivo móvel
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  return (
    <>
      <NavBar />
      {isMobile ? (
        <C.ContainerMobile>

          <C.ContainerCabecalhoMobile>
            <h3 style={{ marginTop: '20px' }}>Perfil do usuário</h3>
            <h5>Bem vindo(a)!</h5>
          </C.ContainerCabecalhoMobile>

          <Form>

            <Row className="mb-3">

              <Form.Group as={Col} controlId="formGridNome" xs={12} sm={6}>
                <Form.Label>Nome:</Form.Label>
                <Form.Control type="nome" placeholder="Nome" />
              </Form.Group>

            </Row>

            <Row className="mb-3">

              <Form.Group as={Col} controlId="formGridSobrenome" xs={12} sm={6}>
                <Form.Label>Sobrenome:</Form.Label>
                <Form.Control type="sobrenome" placeholder="Sobrenome" />
              </Form.Group>

            </Row>

            <Form.Group className="mb-3" controlId="formGridEmail">
              <Form.Label>E-mail:</Form.Label>
              <Form.Control type="email" placeholder="email@email.com" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridPassword">
              <Form.Label>Senha:</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridState" xs={12} sm={6}>
                <Form.Label>Estado</Form.Label>
                <Form.Select defaultValue="Escolha">
                  <option>Escolha...</option>
                  <option>Acre</option>
                  <option>Alagoas</option>
                  <option>Amapá</option>
                  <option>Amazonas</option>
                  <option>Bahia</option>
                  <option>Ceará</option>
                  <option>Distrito Federal</option>
                  <option>Espírito Santo</option>
                  <option>Goiás</option>
                  <option>Maranhão</option>
                  <option>Mato Grosso</option>
                  <option>Mato Grosso do Sul</option>
                  <option>Minas Gerais</option>
                  <option>Pará</option>
                  <option>Paraíba</option>
                  <option>Paraná</option>
                  <option>Pernambuco</option>
                  <option>Piauí</option>
                  <option>Rio de Janeiro</option>
                  <option>Rio Grande do Norte</option>
                  <option>Rio Grande do Sul</option>
                  <option>Rondônia</option>
                  <option>Roraima</option>
                  <option>Santa Catarina</option>
                  <option>São Paulo</option>
                  <option>Sergipe</option>
                  <option>Tocantins</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridCEP" xs={12} sm={6}>
                <Form.Label>CEP:</Form.Label>
                <Form.Control />
              </Form.Group>

            </Row>

            <Form.Group className="mb-3" controlId="formGridCidade">
              <Form.Label>Cidade:</Form.Label>
              <Form.Control />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress">
              <Form.Label>Endereço:</Form.Label>
              <Form.Control placeholder="Endereço" />
            </Form.Group>


            <Row className="justify-content-center">
              <Col xs={12}>
                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                  Salvar
                </Button>
              </Col>
            </Row>

            <Row className="justify-content-center mt-3">
              <Col xs={12}>
                <Button variant="danger" style={{ width: '100%' }}>
                  Cancelar
                </Button>
              </Col>
            </Row>

            {/* Espaço em branco para melhorar a visibilidade */}
            <div style={{ height: '40px' }}></div>

          </Form>
        </C.ContainerMobile >
      ) : (
        <C.Container>
          <Form>
            <Row className="mb-3">

              <Form.Group as={Col} controlId="formGridNome" xs={12} sm={6}>
                <Form.Label>Nome:</Form.Label>
                <Form.Control type="nome" placeholder="Nome" />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridSobrenome" xs={12} sm={6}>
                <Form.Label>Sobrenome:</Form.Label>
                <Form.Control type="sobrenome" placeholder="Sobrenome" />
              </Form.Group>

            </Row>

            <Form.Group className="mb-3" controlId="formGridEmail">
              <Form.Label>E-mail:</Form.Label>
              <Form.Control type="email" placeholder="email@email.com" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridPassword">
              <Form.Label>Senha:</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridCEP" xs={12} sm={6}>
                <Form.Label>CEP:</Form.Label>
                <Form.Control />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridState" xs={12} sm={6}>
                <Form.Label>Estado</Form.Label>
                <Form.Select defaultValue="Escolha">
                  <option>Escolha...</option>
                  <option>Acre</option>
                  <option>Alagoas</option>
                  <option>Amapá</option>
                  <option>Amazonas</option>
                  <option>Bahia</option>
                  <option>Ceará</option>
                  <option>Distrito Federal</option>
                  <option>Espírito Santo</option>
                  <option>Goiás</option>
                  <option>Maranhão</option>
                  <option>Mato Grosso</option>
                  <option>Mato Grosso do Sul</option>
                  <option>Minas Gerais</option>
                  <option>Pará</option>
                  <option>Paraíba</option>
                  <option>Paraná</option>
                  <option>Pernambuco</option>
                  <option>Piauí</option>
                  <option>Rio de Janeiro</option>
                  <option>Rio Grande do Norte</option>
                  <option>Rio Grande do Sul</option>
                  <option>Rondônia</option>
                  <option>Roraima</option>
                  <option>Santa Catarina</option>
                  <option>São Paulo</option>
                  <option>Sergipe</option>
                  <option>Tocantins</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formGridCidade">
              <Form.Label>Cidade:</Form.Label>
              <Form.Control />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress">
              <Form.Label>Endereço:</Form.Label>
              <Form.Control placeholder="Endereço" />
            </Form.Group>


            <Row className="justify-content-center">
              <Col xs={12}>
                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                  Salvar
                </Button>
              </Col>
            </Row>

            <Row className="justify-content-center mt-3">
              <Col xs={12}>
                <Button variant="danger" style={{ width: '100%' }}>
                  Cancelar
                </Button>
              </Col>
            </Row>

          </Form>
        </C.Container>
      )
      }
    </>
  );
}

export default AccountPage;
