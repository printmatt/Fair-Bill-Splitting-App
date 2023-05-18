import React, { useEffect, useState } from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingNavBar from "./LandingNavBar";
import Guide from "./Guide";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import NewBalanceModal from './NewBalanceModal';
import BalanceList from "./BalanceList";
import LoadingComponent from "./LoadingComponent";

function App() {

  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null)
  const [balances, setBalances] = useState([]);
  const [showModal, setShowModal] = useState(false);


  function fetchBalances() {
    fetch("/get-balances")
      .then((res) => res.json())
      .then((data) => {
        setBalances(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }


  function initialIsAuthenticated() {
    fetch("/is-authenticated")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        setIsAuth(true)

      })
      .catch((error) => {
        // Handle error
        setIsAuth(false);
        console.log(error.message)
      });
  }

  useEffect(() => {
    initialIsAuthenticated();
    fetchBalances();
  }, [isAuth]);


  let navigate = useNavigate();

  const logOutUser = () => {
    fetch("/logout")
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setUser(null)
        setIsAuth(false)
        
      })

      navigate('/')
  }
  const signUpUser = () => {
    let path = `signup`;
    navigate(path);
  }

  const logInUser = () => {
    let path = `login`;
    navigate(path);
  }


  return (
    <div className="App">
      <LandingNavBar
        title1="Home"
        title2="About"
        loggedIn={isAuth}
        logOut={logOutUser}
      />

      <br></br>
      <br></br>
      {
        isAuth == null ? <Container className="center"><LoadingComponent></LoadingComponent></Container>
        :
        <Container>
                {
        isAuth ?
          <Container>
            <NewBalanceModal
              show={showModal}
              onHide={() => setShowModal(false)}
              fetchBalances={fetchBalances}
            />
            <Container className="center">
              <h1>Dashboard</h1>
            </Container>
            <div>
              <h1>Balances</h1>
              {balances ? <BalanceList balances={balances} /> : <LoadingComponent></LoadingComponent>}

            </div>

            <br></br>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add Balance
            </Button>
          </Container> :
          <Container>
            <Container className="center">
              <h1>Splitting Bills Simplified.</h1>
            </Container>

            <br></br>
            <br></br>
            <Row>
              <Col md={2}>
              </Col>
              <Col className="center mb-3" md={4}>
                <Guide
                  title="Getting Started"
                  subtitle="As quick as 10 seconds"
                  text="Start using Fair with just a phone number!"
                  clickAction={signUpUser}
                  guideRoute="Sign Up" />
              </Col>

              <Col className="center mb-3" md={4}>
                <Guide
                  title="Already a user?"
                  subtitle="Login here"
                  text="Use the phone number you signed up with to log in!"
                  clickAction={logInUser}
                  guideRoute="Login" />
              </Col>
              <Col md={2}>
              </Col>
            </Row>
          </Container>
      }
        </Container>
      }


    </div>
  );
}

export default App;
