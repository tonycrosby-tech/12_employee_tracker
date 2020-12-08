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
    .then((answer) => {
      if (answer.menu === "View Employees") {
        viewEmployees();
      }
      else if (answer.menu === "View Employees by Department") {
        viewEmpByDept();
      }
      else if (answer.menu === "Add Employee") {
        addEmp();
      }
      else if (answer.menu === "Delete Employee") {
        deleteEmp();
      }
      else if (answer.menu === "Update Employees Role") {
        updateEmpRole();
      }
      else if (answer.menu === "Add Role") {
        addRole();
      }
      else if (answer.menu === "End") {
        connection.end();
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
        console.log("Employees are viewed!\n");

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
        console.log("Inserted successfully!\n");

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

    const deleteEmpChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    empDelete(deleteEmpChoices);
  })
}

function empDelete(deleteEmpChoices) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: "Which employee do you want to remove?",
      choices: deleteEmpChoices,
    },
  ])
  .then(function (answer) {
    const query = `DELETE FROM employee WHERE ?`;

    connection.query(query, { id: answer.employeeId }, (err, res) => {
      if (err) throw err;

      console.table(res);
      console.log("Deleted!\n");

      start();
    });
    console.log(query.sql);
  })
}

function updateEmpRole() {
  employeeArr();
}

function employeeArr() {

  const query = `SELECT * FROM employee`;

  connection.query(query, (err, res) => {
    if (err) throw err;

    const empChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("UpdateARR!\n");

    roleArr(empChoices);
  })
}

function roleArr(empChoices) {
  console.log("Updating role!\n");

  const query = `SELECT r.id, r.title, r.salary
  FROM role r`;

  let roleChoices;

  connection.query(query, (err, res) => {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));
    console.table(res);
    console.log("roleArr Update!\n");

    promptEmpRole(empChoices, roleChoices);
  })
  console.log(query.sql);
}

function promptEmpRole(empChoices, roleChoices) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: 'Which Employee do you want to set with this role?',
      choices: empChoices,
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'Which role do you want to update?',
      choices: roleChoices,
    },
    console.log(empChoices, roleChoices)
  ])
  .then(function (answer) {
    const query = `UPDATE employee SET role_id = ? WHERE id = ?`;
    connection.query(query, [ answer.employeeId, answer.roleId ], (err, res) => {
      if (err) throw err;

      console.table(res);
      console.log("Role Updated successfully!");

      start();
    })
    console.log(query.sql);
  })
}

function addRole() {

  var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("Department array!");

    promptAddRole(departmentChoices);
  });
}

function promptAddRole(departmentChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary?"
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoices
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.roleTitle,
        salary: answer.roleSalary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          start();
        });

    });
}
