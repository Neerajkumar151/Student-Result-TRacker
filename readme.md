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

**Prompt 1: Initial Problem Analysis**

> I am building a backend assignment called "Student Result Tracker".
>
> Context:
>
> - There are two tables: `students(id, name, roll_no, class)` and `marks(id, student_id, subject, score, max_score)`.
> - The system must record students, add marks, and calculate result percentages.
>
> Please act as a senior backend developer and a teacher:
>
> 1. Explain the requirements in simple language.
> 2. List the core features I need to build.
> 3. Describe common mistakes beginners make.
> 4. Identify important edge cases.
> 5. Start with "Challenge 1: Requirements Analysis".

**Prompt 2: Assignment Context Alignment**

> This is my full assignment scenario: [paste the Scenario 01 text here].
>
> I need you to:
>
> 1. Explain the assignment clearly.
> 2. Help me convert it into a structured plan.
> 3. Show me the best way to ask the problem in easy steps.
> 4. Tell me whether this prompt is optimal for a beginner:
>    "this is my problem statement 1, first analyze this and make a plan to tackle this problem in easy steps as i am not proffessional in the backend..."

### Stage 2: Technical Logic (SQL & Architecture)

**Prompt 3: SQL Challenge**

> I am working on Challenge 2 for the "Student Result Tracker" backend.
>
> Please act as a senior backend developer and explain the SQL logic clearly.
>
> For each question:
>
> - List all students with total marks
> - Find students scoring < 40% in any subject
> - Compute class average
>
> Do the following:
>
> 1. Explain the logic for each query.
> 2. Write clean SQL for each problem.
> 3. Explain important clauses like `SUM()`, `GROUP BY`, `JOIN`, and `WHERE`.

**Prompt 4: Architectural Decisions**

> I want to build this backend with a simple and readable architecture.
>
> Please answer:
>
> 1. Why should I use Express for this project?
> 2. How should I structure the Express app for easy testing in Postman?
> 3. What are the main files and endpoints I need?
> 4. Write the plan in a way that is easy for a beginner to follow.

### Stage 3: Environment Setup & Troubleshooting

**Prompt 5: System Configuration**

> I have created my project files and a `.env` file, but I need help finishing setup.
>
> Please explain:
>
> 1. What should go in the `.env` file?
> 2. What should go in each project file?
> 3. How do I install dependencies and run the app locally?
> 4. I am using Xubuntu, so also tell me how to install MySQL Workbench on Xubuntu.

**Prompt 6: Debugging Installation**

> I am facing installation errors on Xubuntu.
>
> Here is what happened:
>
> - `sudo dpkg -i mysql-workbench-community_*.deb` failed with "No such file or directory"
> - `ls | grep mysql` shows the downloaded package name
> - dependency problems prevent configuration of `mysql-workbench-community`: depends on `libmysqlclient21`... Package is not installed
> - `sudo systemctl start mysql` reports "Unit mysql.service not found"
>
> Please help me:
>
> 1. Fix the package installation issue.
> 2. Resolve missing dependencies.
> 3. Start the MySQL service correctly.

**Prompt 7: Server Selection**

> I need to download the correct MySQL server for Xubuntu.
>
> I have a list of Generic Linux tarballs and I am using:
>
> - Xubuntu
> - glibc 2.28
> - 64-bit
>
> Please tell me:
>
> 1. Which MySQL tarball to download
> 2. How to choose the correct version
> 3. What is compatible with my system

### Stage 4: Final Verification & Documentation

**Prompt 8: Compliance Check**

> I will upload the assignment PDF.
>
> Please:
>
> 1. Compare the PDF requirements with my current project context.
> 2. Confirm whether the user stories, SQL queries, and code logic match the assignment.
> 3. Tell me if anything is missing or needs correction.
>
> Then I will tell you what I want next.

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
- Assignment: Student Result Tracker - Scenario 01
