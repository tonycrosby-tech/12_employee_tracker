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
  database: "employee_trackerdb",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

function start() {
  inquirer
    .prompt({
      type: "list",
      name: "menu",
      message: "What would you like to do?",
      choices: [
        "View Employees",
        "View Employees by Department",
        "Add Employee",
        "Delete Employee",
        "Update Employees Role",
        "Add Role",
        "End",
      ],
    })
    .then((task) => {
      switch (task) {
        case "View Employees":
          viewEmployees();
          break;
        case "View Employees by Department":
          viewEmpByDept();
          break;
        case "Add Employee":
          addEmp();
          break;
        case "Delete Employee":
          deleteEmp();
          break;
        case "Update Employees Role":
          updateEmpRole();
          break;
        case "Add Role":
          addRole();
          break;
        case "End":
          connection.end();
          break;
      }
    });
}

function viewEmployees() {
  const query = `
  SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
  ON m.id = e.manager_id
  `;

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    console.log("Employees Viewed!\n");
    start();
  });
}

function viewEmpByDept() {
  console.log("Viewing Employees by Department!");

  const query = `
  SELECT d.id, d.name, r.salary AS budget
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  GROUP BY d.id, d.name`;

  connection.query(query, (err, res) => {
    if (err) throw err;

    const deptChoice = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    console.table(res);
    console.log("Department view success!\n");

    promptDept(deptChoice);
  });
}

function promptDept(deptChoice) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "deptId",
        message: "Which department will you pick?",
        choices: deptChoice,
      },
    ])
    .then(function (answer) {
      console.log("answer", answer.deptId);

      const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
      FROM employee e
      JOIN role r
      ON e.role_id = r.id
      JOIN department d
      ON d.id = r.department_id
      WHERE d.id = ?`;

      connection.query(query, answer.deptId, (err, res) => {
        if (err) throw err;

        console.table("response", res);
        console.log(res.affectedRows + "Employees are viewed!\n");

        start();
      });
    });
}

function addEmp() {
  console.log("Inserting new Employee!\n");

  const query = `
  SELECT r.id, r.title, r.salary
  FROM role r`;

  connection.query(query, (err, res) => {
    if (err) throw err;

    const roleChoice = res.map(({ id, title, salary}) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);

    promptAdd(roleChoice);
  })
}

function promptAdd(roleChoice) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'What is the employees first name?',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'What is the employees last name?',
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'What is the employees Role?',
      choices: roleChoice,
    },
  ])
  .then(function (answer) {
    console.log(answer);

    const query = ` INSERT INTO employee SET ?`;
    connection.query(query,
      {
        first_name: answer.first_name,
        last_name: answer.last_name,
        role_id: answer.roleId,
        manager_id: answer.managerId,
      },
      (err, res) => {
        if (err) throw err;

        console.table(res);
        console.log(res.insertedRows + "Inserted successfully!\n");

        start();
      }
    );
  });
}

function deleteEmp() {
  console.log("Deleteing an Employee");

  const query = `
  SELECT e.id, e.first_name, e.last_name
  FROM employee e`;

  connection.query(query, (err, res) => {
    if (err) throw err;
  })
}
