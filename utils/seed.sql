USE  employee_trackerDB;

INSERT INTO department (name)
VALUES ("Sales");
INSERT INTO department (name)
VALUES ("Maintenance");
INSERT INTO department (name)
VALUES ("Financial");
INSERT INTO department (name)
VALUES ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales", 35000, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 35000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Technician", 45000, 3);
INSERT INTO role (title, salary, department_id)
VALUES ("Financial Advisor", 65000, 4);
INSERT INTO role (title, salary, department_id)
VALUES ("Lawyer", 100000, 5);
