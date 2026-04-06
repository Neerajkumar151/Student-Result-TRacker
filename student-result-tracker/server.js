const express = require("express");
const pool = require("./db");
require("dotenv").config(); // Load environment variables from .env

const app = express();
app.use(express.json()); // Parse JSON bodies for incoming requests

// Add a new student
app.post("/students", async (req, res) => {
  try {
    const { name, roll_no, class: studentClass } = req.body;

    // Validate required fields
    if (!name || !roll_no || !studentClass) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert the student record into the database
    await pool.execute(
      "INSERT INTO students (name, roll_no, class) VALUES (?, ?, ?)",
      [name, roll_no, studentClass]
    );

    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add marks for a student
app.post("/marks", async (req, res) => {
  try {
    const { student_id, subject, score, max_score } = req.body;

    // Validate required fields
    if (!student_id || !subject || score == null || max_score == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Ensure the maximum score is a positive number
    if (max_score <= 0) {
      return res.status(400).json({ error: "max_score must be greater than 0" });
    }

    // Insert the marks record into the database
    await pool.execute(
      "INSERT INTO marks (student_id, subject, score, max_score) VALUES (?, ?, ?, ?)",
      [student_id, subject, score, max_score]
    );

    res.status(201).json({ message: "Marks added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch result for one student
app.get("/students/:id/result", async (req, res) => {
  try {
    const { id } = req.params;

    // Sum scores and max scores for the student
    const [rows] = await pool.execute(
      `SELECT 
        SUM(score) AS total_score,
        SUM(max_score) AS total_max
       FROM marks
       WHERE student_id = ?`,
      [id]
    );

    // If no marks exist, return 404
    if (!rows[0].total_score) {
      return res.status(404).json({ error: "No marks found" });
    }

    const total = rows[0].total_score;
    const max = rows[0].total_max;

    // Calculate percentage and pass/fail status
    const percentage = (total / max) * 100;
    const status = percentage >= 40 ? "Pass" : "Fail";

    res.json({
      total,
      max,
      percentage: percentage.toFixed(2),
      status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch top 5 students by total marks
app.get("/results/toppers", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.name,
             SUM(m.score) AS total_score
      FROM students s
      JOIN marks m ON s.id = m.student_id
      GROUP BY s.id
      ORDER BY total_score DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});