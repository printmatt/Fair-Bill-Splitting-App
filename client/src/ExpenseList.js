import { Accordion, Badge, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import LoadingComponent from './LoadingComponent';

function ExpenseList({ expenses, userId }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [expensesDetails, setExpensesDetails] = useState(null);
  const [myPayingExpenses, setMyPayingExpenses] = useState([]);
  const [myOwedExpenses, setMyOwedExpenses] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)

  useEffect(() => {
    const fetchExpensesDetails = async () => {
      const details = {};
      const payingExpenses = [];
      const owedExpenses = [];
      let expenseDebt = 0;
      let expenseCredit = 0;


      for (let expense of expenses) {
        const res = await fetch(`/get-users-in-expense?expense_id=${expense.ExpenseID}`);
        const data = await res.json();
        details[expense.ExpenseID] = data;

        let userDataInExpense;
        let payer;
        let money = 0;

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const element = data[key];
            money += element["Amount"];
            if (element["Payer"]) {
              payer = element["FirstName"] + " " + element["LastName"];
            }
            if (element["UserID"] == userId) {
              money -= element["Amount"];
              userDataInExpense = element;
            }
          }
        }

        if (userDataInExpense.Payer) {
          console.log('pay')
          payingExpenses.push(expense)
          expenseCredit += money
        }
        else {
          console.log('owe')
          expense["Payer"] = payer
          owedExpenses.push(expense)
          expenseDebt += userDataInExpense.Amount
        }
      }
      
      setExpensesDetails(details);
      setMyPayingExpenses(payingExpenses);
      setMyOwedExpenses(owedExpenses);
      setTotalDebt(expenseDebt);
      setTotalCredit(expenseCredit);
      setIsLoaded(true);

      console.log(details)
      console.log(payingExpenses);
      console.log(owedExpenses);
    };

    fetchExpensesDetails();
  }, [expenses]);


  return (
    <div>
      {
        !isLoaded ? 
        <div className='center'>
          <LoadingComponent/>
        </div> :
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>
                <Badge bg="success">Expenses You Paid</Badge>
              </h2>
              <h4>
                <Badge bg="secondary">Gain Back: ${totalCredit}</Badge>
              </h4>
            </div>


            <Accordion alwaysOpen>
              {myPayingExpenses.map((expense, index) => (
                <Accordion.Item
                  eventKey={index.toString()}
                >
                  <Accordion.Header>
                    <div className="col">
                      {expense.ExpenseTitle}
                    </div>
                    <div className="col text-end">
                      {`Total: \$${expense.Total}`}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className='center'>

                    <Table hover size="sm" responsive>
                      <thead>
                        <tr>
                          <th></th>
                          <th className='center'>Owes You</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          expensesDetails[expense.ExpenseID]
                            .filter((element) => { return element.UserID != userId })
                            .map((element, index) => (
                              <tr key={index}>
                                <td>{element.FirstName + ' ' +  element.LastName}</td>
                                <td className='center'>{'$' + element.Amount}</td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </Table>

                  </Accordion.Body>

                </Accordion.Item>
              ))}
            </Accordion>

            <br></br>
            <br></br>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>
                <Badge bg="success">Expenses You Owe</Badge>
              </h2>
              <h4>
                <Badge bg="secondary">Pay Away: ${totalDebt}</Badge>
              </h4>
            </div>
            <Accordion alwaysOpen>
              {myOwedExpenses.map((expense, index) => (
                <Accordion.Item
                  eventKey={index.toString()}
                >
                  <Accordion.Header>
                    <div className="col">
                      <span style={{ fontWeight: 'bold' }}>{expense.Payer}</span>
                      {" paid for " + expense.ExpenseTitle}

                    </div>
                    <div className="col text-end">
                      {`Total: \$${expense.Total}`}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className='center'>

                    <Table hover size="sm" responsive>
                      <thead>
                        <tr>
                          <th></th>
                          <th className='center'>Owes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          expensesDetails[expense.ExpenseID]
                            .filter((element) => { return !element.Payer })
                            .map((element, index) => (
                              <tr key={index}>
                                <td>{element.FirstName}</td>
                                <td className='center'>{'$' + element.Amount}</td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </Table>

                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

          </div>

      }
    </div>

  );
}

export default ExpenseList;
