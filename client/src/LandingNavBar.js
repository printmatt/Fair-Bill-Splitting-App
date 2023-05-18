import { Container, Nav, Navbar, Button } from 'react-bootstrap';

function LandingNavBar({ title1, title2, loggedIn, logOut }) {
  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <Container>
        <Navbar.Brand href="/">Fair</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">{title1}</Nav.Link>
          </Nav>
          {loggedIn && <Button variant="outline-light" onClick={logOut}>Log Out</Button>}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default LandingNavBar;
