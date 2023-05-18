import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { Alert } from 'react-bootstrap';

function NewExpenseModal({ show, onHide, fetchExpenses, users, currentUser, currentBalanceId }) {
    const [title, setTitle] = useState("");
    const [total, setTotal] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([currentUser.userId]);
    const [amounts, setAmounts] = useState({[parseInt(currentUser.userId)] : 0})
    const [splitMethod, setSplitMethod] = useState('even');
    const [errorMessage, setErrorMessage] = useState("");


    function handleSubmit(e) {
        e.preventDefault();
        setErrorMessage("");
        handleCreateExpense(title, total, selectedUsers).then((async (data) =>{
            await fetchExpenses();
            console.log("expense created and expenses updated");
        }));
        
    }

    async function handleCreateExpense(title, total, selectedUsers) {
        if(title == "" || total == 0){
            setErrorMessage("ERROR: Missing fields or total is 0.");
            return;
        }
        if(selectedUsers.length === 0) {
            setErrorMessage("ERROR: Insufficient participants in expense.");
            return;
        }
        // Checking if the total and the amounts match
        let amountsTotal = 0;
        let usersAmounts = {...amounts};
        for(let key in usersAmounts){
            if(splitMethod === 'even' && key != currentUser.userId){
                usersAmounts[key] = Math.ceil(total / selectedUsers.length);
                amountsTotal += Math.ceil(total / selectedUsers.length);
            }
            else{
                if(key != currentUser.userId && usersAmounts[key] == 0){
                    console.log(key);
                    console.log(usersAmounts[key]);
                    setErrorMessage("ERROR: You need to specify an amount for each user involved.");
                    return;
                }
                amountsTotal += parseInt(usersAmounts[key]);
                if(amountsTotal > parseInt(total)){
                    setErrorMessage("ERROR: The amount your friends owe is more than your total. Cannot create a new expense.");
                    return;
                }  
            }
        }

        console.log("Total: " + total)
        console.log("Amounts Total: " + amountsTotal)
        usersAmounts[currentUser.userId] = total - amountsTotal;
                

        fetch("/create-expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                total: total,
                users: selectedUsers,
                usersAmounts: usersAmounts,
                balanceId: currentBalanceId
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                //console.log(data);
            })
            .catch((error) => {
                console.log(error.message);
            });
        
            setTitle("");
            setTotal("");
            setSelectedUsers([currentUser.userId]);
            setAmounts({[parseInt(currentUser.userId)] : 0});
            fetchExpenses();
            onHide();

    }

    function handleUserSelect(e) {
        const id = parseInt(e.target.value);
        let newAmounts = { ...amounts }; // create a new object for the updated amounts

        if (selectedUsers.includes(id)) {
          setSelectedUsers(selectedUsers.filter((UserID) => UserID !== id));
          delete newAmounts[id];
        } else {
          setSelectedUsers([...selectedUsers, id]);
          newAmounts[id] = 0;
        }
        setAmounts(newAmounts); // set the state with the new object
      }

    const handleSplitMethodChange = (e) => {
        setSplitMethod(e.target.value);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Create New Expense</Modal.Title>
            </Modal.Header>
            {
                errorMessage == "" ? null : <Alert key='danger' variant='danger'>
                    {errorMessage}
                </Alert>
            }
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <br />
                    <Form.Group controlId="formBasicTotal">
                        <Form.Label>Total</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter total"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <br />
                    <Form.Group controlId="formBasicSplitMethod">
                        <Form.Label>Split Method</Form.Label>
                        <div>
                            <Form.Check
                                inline
                                type="radio"
                                label="Evenly"
                                value="even"
                                checked={splitMethod === 'even'}
                                onChange={handleSplitMethodChange}
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label="By Specific Amounts"
                                value="specific"
                                checked={splitMethod === 'specific'}
                                onChange={handleSplitMethodChange}
                            />
                        </div>
                    </Form.Group>
                    <br />
                    <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Members Involved</Form.Label>
                        {users.filter((user) => currentUser.userId !== user.UserID).map((user) => (
                            <div key={user.UserID}>
                                <Form.Check
                                    type="checkbox"
                                    label={user.FirstName + " " + user.LastName}
                                    value={user.UserID}
                                    onChange={handleUserSelect}
                                    checked={selectedUsers.includes(user.UserID)}
                                />
                                {splitMethod === 'specific' && selectedUsers.includes(user.UserID) && (
                                    <Form.Control
                                        type="number"
                                        placeholder={`Amount for ${user.FirstName}`}
                                        value={amounts[user.UserID]}
                                        onChange={(e) => {
                                            let newUsersAmounts = {...amounts};
                                            newUsersAmounts[parseInt(user.UserID)] = parseInt(e.target.value);
                                            setAmounts(newUsersAmounts);
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </Form.Group>
                    <br />
                    
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default NewExpenseModal;
