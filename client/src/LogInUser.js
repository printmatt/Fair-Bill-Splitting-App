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
import { useLocation } from 'react-router-dom';


function LogInUser() {
    const location = useLocation();
    const balance_id = location.state?.balance_id || null;
    console.log(balance_id)
    const [phoneNumber, setPhoneNumber] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [showVerificationCode, setShowVerificationCode] = useState(false);

    let navigate = useNavigate();

    const handlePhoneChange = (e) => {
        // Remove all non-numeric characters from the input value
        const formattedValue = e.target.value.replace(/\D/g, '');

        // Format the phone number as +1 (XXX) XXX-XXXX
        let formattedPhone = formattedValue.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

        setPhoneNumber(formattedPhone);
    };

    const sendVerificationCode = event => {
        event.preventDefault();
        setAlertMessage("");

        fetch("/twilio-sms/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber.replace(/\D/g, ""),
            }),
        })
            .then((response) => {
                if (response.ok) {
                    setShowVerificationCode(true);
                } else {
                    setAlertMessage("Cannot send verification code to phone number!");
                    throw new Error(response.statusText);
                }
            })
            .catch((error) => {
                // Handle error
                console.log(error.message)
            });

    }

    const loginUser = event => {
        event.preventDefault();
        setAlertMessage("");

        // fetch("/login", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         phoneNumber: phoneNumber.replace(/\D/g, ""),
        //     }),
        // })
        //     .then((res) => {
        //         navigate('/')
        //         if (res.ok) {
        //             navigate('/')
        //         }
        //     })
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
                    console.log("User is logged in");
                    fetch("/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            phoneNumber: phoneNumber.replace(/\D/g, ""),
                        }),
                    })
                        .then((res) => {
                            if (res.ok) {
                                console.log(balance_id)
                                navigate('/' + (balance_id !== null ? 'balances/' + balance_id : ''));

                            }
                            else {
                                throw new Error();
                            }
                        })
                } else {
                    setAlertMessage("Verification Failed!");
                    throw new Error(response.statusText);
                }
            })
            .catch((error) => {
                // Handle error
                setAlertMessage("An Error Occured!");
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
                <h1>Login</h1>
            </Container>

            <br />
            <br />

            {
                alertMessage == "" ? null : <Alert key='danger' variant='danger'>
                    {alertMessage}
                </Alert>
            }

            <Form className="form center" onSubmit={loginUser}>
                <Form.Group as={Row} className="mb-3" controlId="formPhoneNumber">
                    <Form.Group className="mb-3" controlId="formPhoneNumber">
                        <FloatingLabel controlId="floatingInput" label="Phone Number" className="mb-3">
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
                </Form.Group>

                {showVerificationCode && (
                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                        <Form.Group className="mb-3" controlId="formPlaintextPassword">
                            <FloatingLabel controlId="floatingInput" label="Verification Code" className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={verificationCode}
                                    onChange={(event) => setVerificationCode(event.target.value)}
                                    required
                                />
                            </FloatingLabel>
                        </Form.Group>
                    </Form.Group>
                )}

                <Row className="g-2">
                    {!showVerificationCode ? (
                        <Col>
                            <Button variant="secondary" onClick={sendVerificationCode}>
                                Send Code
                            </Button>
                        </Col>
                    ) : (
                        <Col sm="7">
                            <Button size="md" variant="primary" type="submit">
                                Login
                            </Button>
                        </Col>
                    )}
                </Row>
            </Form>
        </div>
    );
}

export default LogInUser;