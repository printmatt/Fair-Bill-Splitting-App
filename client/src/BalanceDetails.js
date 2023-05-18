import React, { useEffect, useState } from "react";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingNavBar from "./LandingNavBar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { useParams } from "react-router-dom";
import ExpenseList from "./ExpenseList";
import NewExpenseModal from "./NewExpenseModal";
import SignUpUserInBalance from "./SignUpUserInBalance";
import BackButton from "./BackButton";
import LoadingComponent from "./LoadingComponent";
import SettlementModal from "./SettlementModal";
import CopyButton from "./CopyButton";
import { Badge } from "react-bootstrap";

function BalanceDetails() {

  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [users, setUsers] = useState([])
  const { id } = useParams();

  function initialIsAuthenticated() {
    fetch("/is-authenticated")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        setIsAuth(true)

      })
      .catch((error) => {
        // Handle error
        setIsAuth(false)
        console.log(error.message)
      });
  }

  async function fetchExpenses() {
    fetch(`/get-expenses?balance_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setExpenses(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function fetchSettlement() {
    fetch(`/get-settlement-in-balance?balance_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSettlements(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }


  function fetchUsers(balance_id) {
    fetch(`/get-users-in-balance?balance_id=${balance_id}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        const userExists = data.find(u => u.UserID === user.userId) !== undefined;
        if (!userExists && isAuth) {
          fetch("/create-user-in-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              balanceId: balance_id
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            })
            .catch((error) => {
              console.log(error.message);
            });
        }
        console.log(users);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  useEffect(() => {
    initialIsAuthenticated();
    fetchExpenses();
    fetchUsers(id);
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

  const logInUserInBalance = () => {
    console.log(id)
    navigate('/login', { state: { balance_id: id } });
  }

  const goBack = () => {
    navigate('/');
  }



  return (
    <div className="Balance">
      <LandingNavBar
        title1="Home"
        title2="About"
        loggedIn={isAuth}
        logOut={logOutUser}
      />


      <br></br>
      <br></br>
      {
        isAuth == null ?
          <Container className="center">
            <LoadingComponent></LoadingComponent>
          </Container>
          :
          <Container>{isAuth ?
            <Container>
              <BackButton handleBackButtonClicked={goBack}></BackButton>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div></div>
              <CopyButton url={`https://fairbilling.herokuapp.com/balances/${id}`}></CopyButton>
              </div>
              <h1>Balance Details</h1>
              <br></br>
              <ExpenseList expenses={expenses} userId={user.userId}></ExpenseList>
              <br></br>

              <NewExpenseModal
                show={showModal}
                users={users}
                onHide={() => setShowModal(false)}
                fetchExpenses={fetchExpenses}
                currentUser={user}
                currentBalanceId={id}
              ></NewExpenseModal>

              <SettlementModal
                settlements={settlements}
                show={showSettlementModal}
                onHide={() => setShowSettlementModal(false)}
              >
              </SettlementModal>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button style={{ width: '140px', height: '40px' }} variant="success" onClick={() => setShowModal(true)}>
                  Add Expense
                </Button>
                <Button style={{ width: '140px', height: '40px' }} variant="primary" onClick={() => {
                  fetchSettlement();
                  setShowSettlementModal(true)
                }}>
                  Settle Balance
                </Button>
              </div>


            </Container> :
            <Container>
              <Container className="center">
                <h1>Sign Up To Join This Balance</h1>
              </Container>
              <Container className="center">
                <div>or log in <Button size="sm" onClick={logInUserInBalance}>here</Button> if you have an account</div>
              </Container>
              <SignUpUserInBalance
                balanceId={id}
                checkIsAuth={initialIsAuthenticated}
              ></SignUpUserInBalance>
            </Container>
          }
          </Container>}

    </div>
  );
}

export default BalanceDetails;
