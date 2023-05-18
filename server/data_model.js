
const Pool = require('pg').Pool


const pool = new Pool({
    user: process.env.user || 'postgres',
    host: process.env.host || 'localhost',
    database: process.env.database || 'postgres',
    password: process.env.password ||  '5432',
    port:  process.env.port || 5432,
});

// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });


const createBalance = (body) => {
    return new Promise(function (resolve, reject) {
        const { title, status } = body
        pool.query('INSERT INTO "Balance" ("Title", "Status") VALUES ($1, $2) RETURNING *;', [title, status], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(JSON.stringify(results.rows[0]));
        })
    })
}


const createUser = (body) => {
    return new Promise(function (resolve, reject) {
        const { first_name, last_name, phone_number } = body;
        console.log(body);
        pool.query('SELECT * FROM "User" WHERE "PhoneNumber" = $1;', [phone_number], (error, results) => {
            if (error) {
                console.log("find user error")
                console.error('Error executing query:', error);
                reject(error);
            }
            console.log(JSON.stringify(results));
            if (results.rowCount > 0) {
                reject(new Error('A user with phone number ' + phone_number + ' already exists'));
            } else {
                pool.query('INSERT INTO "User" ("FirstName", "LastName", "PhoneNumber") VALUES ($1, $2, $3) RETURNING *;', [first_name, last_name, phone_number], (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(JSON.stringify(results.rows[0]));
                });
            }
        });
    });
};


const createUserInBalance = (body) => {
    return new Promise(function (resolve, reject) {
        const { user_id, balance_id } = body
        pool.query('INSERT INTO "UserInBalance" ("UserID", "BalanceID") VALUES ($1, $2) RETURNING *;', [user_id, balance_id], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(JSON.stringify(results.rows[0]));
        })
    })
}


const getUser = (phone_number) => {
    return new Promise(function (resolve, reject) {
        phone_number = parseInt(phone_number)
        pool.query('SELECT * FROM "User" WHERE "PhoneNumber" = $1;', [phone_number], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            if (results.rowCount > 0) {
                resolve(JSON.stringify(results.rows[0]));
            }
            else {
                reject(new Error('There is no user with that number!'));
            }

        })
    })
}


const getBalancesForUser = (phone_number) => {
    return new Promise(function (resolve, reject) {
        phone_number = parseInt(phone_number)
        pool.query(`
        SELECT b.* 
        FROM "User" u 
        INNER JOIN "UserInBalance" ub 
        ON u."UserID" = ub."UserID" 
        INNER JOIN "Balance" b 
        ON ub."BalanceID" = b."BalanceID" 
        WHERE u."PhoneNumber" = $1;`, [phone_number], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

// SELECT e.*
// FROM "User" u
// INNER JOIN "UserInBalance" ub ON u."UserID" = ub."UserID"
// INNER JOIN "Expense" e ON ub."BalanceID" = e."BalanceID"
// INNER JOIN "UserInExpense" ue ON e."ExpenseID" = ue."ExpenseID" AND u."UserID" = ue."UserID" AND ub."BalanceID" = ue."BalanceID"
// WHERE u."UserID" = 28 AND e."BalanceID" = 13;

const getExpensesForUser = (user_id, balance_id) => {
    return new Promise(function (resolve, reject) {
        pool.query(`
        SELECT e.*
        FROM "User" u
        INNER JOIN "UserInBalance" ub ON u."UserID" = ub."UserID"
        INNER JOIN "Expense" e ON ub."BalanceID" = e."BalanceID"
        INNER JOIN "UserInExpense" ue ON e."ExpenseID" = ue."ExpenseID" AND u."UserID" = ue."UserID" AND ub."BalanceID" = ue."BalanceID"
        WHERE u."UserID" = $1 AND e."BalanceID" = $2;
      ;
    `, [user_id, balance_id], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

const getUsersInBalance = (balance_id) => {
    return new Promise(function (resolve, reject) {
        pool.query(`
        SELECT u.*
        FROM "User" u 
        INNER JOIN "UserInBalance" ub 
        ON u."UserID" = ub."UserID" 
        INNER JOIN "Balance" b 
        ON ub."BalanceID" = b."BalanceID" 
        WHERE b."BalanceID" = $1;`, [balance_id], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

const createExpense = (body) => {
    return new Promise(function (resolve, reject) {
        var { expense_title, total, balance_id } = body;
        total = parseFloat(total);
        balance_id = parseInt(balance_id);
        pool.query(`INSERT INTO "Expense" ("ExpenseTitle", "Total", "BalanceID") VALUES ($1, $2, $3) RETURNING *;`, [expense_title, total, balance_id], (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.stringify(results.rows[0]));
        });
    });
};

const createUserInExpense = (body) => {
    return new Promise(function (resolve, reject) {
        var { user_id, expense_id, balance_id, payer, amount, resolved } = body;
        console.log(body)
        expense_id = parseInt(expense_id);
        balance_id = parseInt(balance_id);
        user_id = parseInt(user_id);
        amount = parseFloat(amount);
        pool.query(`INSERT INTO "UserInExpense" ("UserID", "ExpenseID", "BalanceID", "Payer", "Amount", "Resolved") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, [user_id, expense_id, balance_id, payer, amount, resolved], (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.stringify(results));
        });
    });
};

const getUsersInExpense = (expense_id) => {
    return new Promise(function (resolve, reject) {
        expense_id = parseInt(expense_id)
        pool.query(`
        SELECT 
            u."UserID",
            u."FirstName",
            u."LastName",
            ue."Resolved",
            ue."Amount",
            ue."Payer",
            e."ExpenseID"
        FROM 
            "User" u 
            JOIN "UserInExpense" ue ON u."UserID" = ue."UserID"
            JOIN "Expense" e ON e."ExpenseID" = ue."ExpenseID"
        WHERE 
            e."ExpenseID" = $1;`, [expense_id], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

const getSettlementInBalance = (balance_id) => {
    return new Promise(function (resolve, reject) {
        pool.query(`
        SELECT u."UserID", u."FirstName", u."LastName",
        SUM(CASE WHEN uie."Payer" = TRUE THEN (e."Total" - uie."Amount") ELSE (0 - uie."Amount") END) AS "Credit"
        FROM "User" u 
        INNER JOIN "UserInBalance" uib ON u."UserID" = uib."UserID" 
        INNER JOIN "Balance" b ON uib."BalanceID" = b."BalanceID" AND b."BalanceID" = $1
        INNER JOIN "Expense" e ON b."BalanceID" = e."BalanceID" 
        INNER JOIN "UserInExpense" uie ON e."ExpenseID" = uie."ExpenseID" AND u."UserID" = uie."UserID"
        GROUP BY u."UserID";`, [balance_id], (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

module.exports = {
    createBalance,
    createUser,
    createUserInBalance,
    createExpense,
    createUserInExpense,
    getUser,
    getBalancesForUser,
    getExpensesForUser,
    getUsersInBalance,
    getUsersInExpense,
    getSettlementInBalance
}