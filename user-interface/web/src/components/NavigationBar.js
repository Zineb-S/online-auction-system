import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

const NavigationBar = () => {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    navigate('/login'); // Redirect to login page
    window.location.reload(); // Optional: to enforce reloading the entire app
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">Bex Auction House</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/auctions">Auctions</Nav.Link>
            <Nav.Link href="/live-auctions">Live Now</Nav.Link>
            {!isAuthenticated ? (
              <>
                <Nav.Link href="/signup">Create an account</Nav.Link>
                <Nav.Link href="/login">Access your account</Nav.Link>
              </>
            ) : (
              <><Nav.Link href="/profile">Profile</Nav.Link>
              <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button></>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
