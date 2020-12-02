const inquirer = require("inquirer");

const mysql = require("mysql");

const consoleTable = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "password",
    database: "employee_trackerDB"
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    
  });

