# Student Result Tracker - Backend

This project is a simple REST API built with Node.js, Express, and MySQL. It helps manage students, store marks, and calculate results.

---

## Table of Contents

- [Overview](#overview)
- [Prompt Log](#prompt-log)
- [System Design](#system-design)
- [API Endpoints](#api-endpoints)
- [Setup](#setup)
- [Database Schema](#database-schema)
- [Run the App](#run-the-app)
- [Notes](#notes)
- [Author](#author)

---

## Overview

This backend supports:

- adding students
- adding marks per subject
- calculating weighted percentage
- showing pass/fail status
- listing top students

It uses `SUM(score) / SUM(max_score)` so different subjects are weighted correctly.

---

## Prompt Log

These prompts were used while building the project.

### Stage 1: Requirements & Planning

**Prompt 1: Requirement Analysis**

> I am building a backend REST API called "Student Result Tracker".
>
> The data model includes two tables:
>
> - `students(id, name, roll_no, class)`
> - `marks(id, student_id, subject, score, max_score)`
>
> The API must record students, store marks, calculate result percentages, determine pass/fail status, and provide summary endpoints.
>
> As a senior backend architect, please:
>
> 1. Summarize the requirements in clear language.
> 2. Identify the core features and user flows.
> 3. List common beginner pitfalls for this assignment.
> 4. Highlight key edge cases and validation rules.

**Prompt 2: Structured Implementation Plan**

> Here is the assignment context: .
>
> Help me translate it into a step-by-step implementation plan. Include:
>
> 1. data model design
> 2. API endpoints and responsibilities
> 3. database queries for result calculation
> 4. testing approach and success criteria

### Stage 2: Technical Design

**Prompt 3: SQL Query Design**

> I need SQL queries for the Student Result Tracker backend with the following model: students and marks.
>
> For each task, please provide:
>
> - a clear description of the logic
> - clean SQL statements
> - explanations of key clauses like `SUM()`, `GROUP BY`, `JOIN`, and `WHERE`
>
> Tasks:
>
> 1. List all students with total marks and percentage.
> 2. Find students scoring below 40% in any subject.
> 3. Compute the average percentage for a class.

**Prompt 4: Architecture and API Structure**

> I want a simple, maintainable Express backend for this assignment.
>
> Please explain:
>
> 1. why Express is a suitable choice
> 2. how to organize routes, controllers, and database access
> 3. which endpoints are required and what each should return
> 4. how to keep the app easy to test with Postman or curl

### Stage 3: Environment Setup

**Prompt 5: Environment and Configuration Guidance**

> I need help finalizing the project setup.
>
> Please explain:
>
> 1. recommended `.env` values for MySQL connection
> 2. what belongs in `server.js`, `db.js`, and `package.json`
> 3. how to install dependencies and start the app
> 4. basic troubleshooting for database connection issues

### Stage 4: Final Verification

**Prompt 6: Assignment Compliance Review**

> I will provide the assignment PDF.
>
> Compare the requirements with the current project scope and:
>
> 1. confirm whether the API endpoints and result logic match the assignment
> 2. identify any missing functionality or incorrect assumptions
> 3. recommend fixes needed to meet the assignment requirements

---

## System Design

- `students` stores: `name`, `roll_no`, `class`
- `marks` stores: `student_id`, `subject`, `score`, `max_score`
- `marks.student_id` links to `students.id`
- Unique key on `(student_id, subject)` avoids duplicate entries

### Result Formula

The result percentage uses:

```text
(sum(score) / sum(max_score)) * 100
```

A student passes when percentage is `>= 40`.

### Validation

- All required fields must be present
- `max_score` must be greater than 0
- No duplicate subject entries per student

---

## API Endpoints

| Method | Path                   | Description                                |
| ------ | ---------------------- | ------------------------------------------ |
| `POST` | `/students`            | Add a new student                          |
| `POST` | `/marks`               | Add marks for one subject                  |
| `GET`  | `/students/:id/result` | Get total marks, percentage, and pass/fail |
| `GET`  | `/results/toppers`     | Get top 5 students by total marks          |
| `GET`  | `/results/failed`      | (Optional) list students under 40%         |

---

## SQL Queries and Challenge 2

### Database schema

```sql
CREATE DATABASE student_tracker;
USE student_tracker;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    class VARCHAR(50) NOT NULL
);

CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### Sample queries

```sql
-- Get total marks per student
SELECT
    students.name,
    students.roll_no,
    SUM(marks.score) AS total_scored,
    SUM(marks.max_score) AS total_marks
FROM students
JOIN marks ON students.id = marks.student_id
GROUP BY students.id, students.name, students.roll_no;

-- Find students who scored less than 40% in any subject
SELECT
    s.name,
    s.roll_no,
    m.subject,
    m.score,
    m.max_score,
    ((m.score / m.max_score) * 100) AS percentage
FROM students s
JOIN marks m ON s.id = m.student_id
WHERE (m.score / m.max_score) * 100 < 40;

-- Calculate class average percentage per subject
SELECT
    subject,
    AVG(score * 100.0 / max_score) AS average_percentage
FROM marks
GROUP BY subject
ORDER BY average_percentage ASC;
```

---

## Setup

### Database

Run these commands in MySQL:

```sql
CREATE DATABASE student_tracker;
USE student_tracker;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  class VARCHAR(50) NOT NULL
);

CREATE TABLE marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject VARCHAR(100) NOT NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT unique_student_subject UNIQUE(student_id, subject)
);
```

### Environment

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_tracker
PORT=3000
```

### Install

```bash
npm install express mysql2 dotenv
```

### Run

```bash
node server.js
```

---

## Notes

- The app uses Express and `mysql2`.
- It calculates results using weighted marks.
- It prevents duplicate subject entries for the same student.

---

## Author

- Neeraj Kumar
- Assignment: Student Result Tracker - Scenario 01

```bash
npm install express mysql2 dotenv
```

### 4. Run the App

```bash
node server.js
```

---

## Debrief: Key Technical Decisions

- **Why `SUM()` instead of `AVG()`?**
  - A simple average treats all subjects equally.
  - `SUM()` gives correct weight to exams with different maximum scores.

- **Handling missing marks**
  - The API avoids returning `NULL` or crashing when a student has no marks.

- **Validation**
  - The backend verifies required fields and enforces business rules for score data.

---

## Author

- Developed by: Neeraj Kumar
- Assignment: Student Result Tracker.
