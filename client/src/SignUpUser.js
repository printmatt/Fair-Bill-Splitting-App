import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import Form from 'react-bootstrap/Form';
import "./App.css";
import LandingNavBar from './LandingNavBar';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Container from 'react-bootstrap/esm/Container';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router-dom';
function SignUpUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [verify, setVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userBody, setUserBody] = useState({});

  let navigate = useNavigate();

  const handlePhoneChange = (e) => {
    // Remove all non-numeric characters from the input value
    const formattedValue = e.target.value.replace(/\D/g, '');

    // Format the phone number as +1 (XXX) XXX-XXXX
    let formattedPhone = formattedValue.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

    setPhoneNumber(formattedPhone);
  };

  const onFormSubmit = event => {
    event.preventDefault();
    setAlertMessage("")
    setUserBody({
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      firstName: firstName,
      lastName: lastName
    })
    if (firstName == "" || lastName == "" || phoneNumber == "") {
      setAlertMessage("Please fill out all required information.")
      return;
    }


    fetch("/twilio-sms/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber.replace(/\D/g, ""),
      })
    })
      .then((response) => {
        if (response.ok) {
          console.log(response);
          setVerify(true);

        } else {
          setAlertMessage("Cannot send verification code to phone number!");
          setUserBody({});
          throw new Error(response.statusText);
        }
      })
      .catch((error) => {
        // Handle error
        console.log(error.message)
      });

  }

  const onVerificationFormSubmit = event => {
    event.preventDefault();
    setAlertMessage("");
    fetch("/twilio-sms/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        otp: verificationCode,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log(response);
          fetch("/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: userBody.firstName,
              last_name: userBody.lastName,
              phone_number: phoneNumber.replace(/\D/g, ""),
            }),
          })
            .then((response) => {
              if (response.ok) {
                console.log(response);
                navigate('/');
              } else {
                setAlertMessage("User already exists. Please log in instead!");
                setVerify(false);
                throw new Error(response.statusText);
              }
            })
            .catch((error) => {
              // Handle error
              console.log(error.message)
            });
        } else {
          setAlertMessage("Verification Failed!");
          setVerify(false);
          throw new Error(response.statusText);
        }
      })
      .catch((error) => {
        // Handle error
        setAlertMessage("Verification Failed!");
        setVerify(false);
        console.log(error.message)
      });

  }

  return (
    <div className='App'>
      <LandingNavBar
        title1="Home"
        title2="About"
        title3="Create A Balance" />

      <br />
      <br />

      <Container className='center'>
        <h1>Sign Up With Your Phone Number</h1>
      </Container>

      <br />
      <br />

      {
        alertMessage == "" ? null : <Alert key='danger' variant='danger'>
          {alertMessage}
        </Alert>
      }

      {
        verify ?
          <Form className='form' onSubmit={onVerificationFormSubmit}>
            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <FloatingLabel
                label="Verification Code"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  required
                />
              </FloatingLabel>
            </Form.Group>
            <br />
            <br />
            <Button variant="primary" type="submit">
              Verify
            </Button>
          </Form>
          : <Form className='form' onSubmit={onFormSubmit}>
            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <FloatingLabel
                controlId="floatingInput"
                label="Phone Number"
                className="mb-3"
              >
                <Form.Control
                  type="tel"
                  placeholder="+1 (123) 456-7890"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  style={{ borderRadius: '10px', fontSize: '18px' }}
                  required
                />

              </FloatingLabel>

            </Form.Group>

            <Row className="g-2">
              <Col md>
                <FloatingLabel controlId="formFirstName" label="First Name">
                  <Form.Control type="text" placeholder="John" value={firstName} required
                    onChange={(event) => setFirstName(event.target.value)} />
                </FloatingLabel>
              </Col>
              <Col md>
                <FloatingLabel controlId="formLastName" label="Last Name">
                  <Form.Control type="text" placeholder="Doe" value={lastName} required
                    onChange={(event) => setLastName(event.target.value)} />
                </FloatingLabel>
              </Col>
            </Row>
            <br />
            <br />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>}



    </div>
  );
}

export default SignUpUser;