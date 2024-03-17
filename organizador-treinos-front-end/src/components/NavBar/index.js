import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function BasicExample() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/home">Organizador de Treinos</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/account">Minha conta</Nav.Link>
            <NavDropdown title="Meus treinos" id="basic-nav-dropdown">
              <NavDropdown.Item href="/newworkout">Cadastrar novo</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/myworkouts">Consultar treinos</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;