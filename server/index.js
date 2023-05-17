
const express = require("express");

const PORT = process.env.PORT || 3000;

const path = require('path')

const app = express();

const data_model = require('./data_model')

const bodyParser = require("body-parser");

const session = require('express-session');

const cookieParser = require('cookie-parser');

const twilioRouter = require("../routes/twilio-sms")

app.use(bodyParser.json());

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }))

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser())

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'user_sid',
  secret: 'somesecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}))

app.use(express.static(path.join(__dirname + "/public")));

// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
//   next();
// });

app.use('/twilio-sms', twilioRouter);



app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
})

/**
 * Check if the current user is logged in, e.g. has a running session
 * (This can and should only be checked backend wise)
 */
app.get("/is-authenticated", (req, res, next) => {
  try {
    if (!req.session.user || !req.cookies.user_sid) {
      throw new Error("Unauthenticated");
    }
    res.json({ authenticated: true, user: req.session.user });
  } catch (err) {
    next(err);
  }
});

// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user) {
    try {
      req.session.destroy(err => {
        if (err) throw new CustomError(500, "Unable to logout");
        res.json({ message: "Success" });
      });
    } catch (err) {
      next(err);
    }
  }
  if (req.cookies.user_sid) {
    res.clearCookie('user_sid');
  }
});

app.post('/login', (req, res) => {

  req.session = req.session || {};

  data_model.getUser(req.body.phoneNumber)
    .then(response => {
      // check if the response is a string
      const user = JSON.parse(response); // convert the response to a JavaScript object
      // log the user object to verify its contents
      req.session.user = {
        phoneNumber: user.PhoneNumber,
        firstName: user.FirstName,
        lastName: user.LastName,
        userId: user.UserID
      }

      res.status(200).send(response);
    })
    .catch(error => {

      res.status(500).send(error);
    })
})


app.post('/signup', (req, res) => {


  data_model.createUser(req.body)
    .then(response => {
      const user = JSON.parse(response); // convert the response to a JavaScript object
      req.session.user = {
        phoneNumber: user.PhoneNumber,
        firstName: user.FirstName,
        lastName: user.LastName,
        userId: user.UserID
      }

      res.status(200).send(response);
    })
    .catch(error => {

      res.status(500).send(error);
    })
})

app.get('/get-balances', (req, res, next) => {

  data_model.getBalancesForUser(req.session.user.phoneNumber)
    .then(response => {


      res.status(200).send(response)
    })
})

app.post('/create-balance', (req, res, next) => {
  data_model.createBalance(req.body)
    .then(response => {
      const balance = JSON.parse(response);
      const data = {
        user_id: req.session.user.userId,
        balance_id: balance.BalanceID
      }
      data_model.createUserInBalance(data)
    })
})

app.post('/create-user-in-balance', (req, res, next) => {
  data_model.createUserInBalance({
    user_id: req.session.user.userId,
    balance_id: req.body.balanceId
  })
})

app.get('/get-expenses', (req, res, next) => {
  const userId = req.session.user.userId;
  const balanceId = req.query.balance_id;
  data_model.getExpensesForUser(userId, balanceId)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send('Error retrieving expenses');
    });
});

app.get('/get-users-in-balance', (req, res, next) => {
  const balanceId = req.query.balance_id;
  data_model.getUsersInBalance(balanceId)
    .then(response => {


      res.status(200).send(response);
    })
    .catch(error => {

      res.status(500).send('Error retrieving users in balance');
    });
});

app.get('/get-users-in-expense', (req, res, next) => {
  const expenseId = req.query.expense_id;
  data_model.getUsersInExpense(expenseId)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {

      res.status(500).send('Error retrieving users in expense');
    });
});

app.post('/create-expense', (req, res, next) => {
  var expenseBody = {
    expense_title: req.body.title,
    total: req.body.total,
    balance_id: req.body.balanceId
  }

  data_model.createExpense(expenseBody)
    .then(response => {

      const expense = JSON.parse(response);
      const expenseId = expense.ExpenseID;

      for (const userId of req.body.users) {
        data_model.createUserInExpense({
          user_id: parseInt(userId),
          expense_id: expenseId,
          balance_id: req.body.balanceId,
          payer: userId == req.session.user.userId ? true : false,
          amount: req.body.usersAmounts[userId],
          resolved: false
        });
      }
    })
})

app.get('/get-settlement-in-balance', (req, res, next) => {
  const balance_id = req.query.balance_id;
  data_model.getSettlementInBalance(balance_id)
    .then(response => {
      let settlements = response;
      let newSettlements = [];
      settlements.sort((a,b) => a.Credit - b.Credit)
      
      for(let i = 0, j = settlements.length-1; i < j; ){
        if(settlements[i].Credit == 0){
          i++;
          continue;
        }

        if(settlements[j].Credit == 0){
          j--;
          continue;
        }
        
        let sum = settlements[i].Credit + settlements[j].Credit;

        if(sum == 0){
          newSettlements.push({
            "From" : settlements[i].FirstName + ' ' +settlements[i].LastName,
            "To" : settlements[j].FirstName + ' ' + settlements[j].LastName,
            "Amount" : 0-settlements[i].Credit
          });
          settlements[i].Credit = 0;
          settlements[j].Credit = 0;
          i++;
          j--;
        }
        else if (sum > 0) {
          newSettlements.push({
            "From" : settlements[i].FirstName + ' ' +settlements[i].LastName,
            "To" : settlements[j].FirstName + ' ' + settlements[j].LastName,
            "Amount" : 0-settlements[i].Credit
          });
          settlements[i].Credit = 0;
          settlements[j].Credit = sum;
          i++;
        }
        else if(sum < 0) {
          newSettlements.push({
            "From" : settlements[i].FirstName + ' ' +settlements[i].LastName,
            "To" : settlements[j].FirstName + ' ' + settlements[j].LastName,
            "Amount" : settlements[j].Credit
          });
          settlements[i].Credit = sum;
          settlements[j].Credit = 0;
          j--;
        }
      }
      res.status(200).send(newSettlements);
    })
    .catch(error => {
      res.status(500).send('Error retrieving users in expense');
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(PORT, () => {

});