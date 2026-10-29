
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/", (req, res) => {
  res.send("CareerPilot MySQL Backend is Running!");
});

// Get all applications
app.get("/applications", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM applications ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Add a new application
app.post("/applications", async (req, res) => {
  try {
    const { id, title, company, location } = req.body;

    if (id == null || !title || !company) {
      return res.status(400).json({
        message: "id, title and company are required",
      });
    }

    const appliedAt = new Date().toISOString().split("T")[0];

    await pool.execute(
      `INSERT INTO applications
       (id, title, company, location, appliedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title, company, location || "", appliedAt]
    );

    res.status(201).json({
      message: "Application saved successfully",
      id,
      title,
      company,
      location: location || "",
      appliedAt,
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This application ID already exists",
      });
    }

    res.status(500).json({ message: "Failed to save application" });
  }
});

// Delete an application
app.delete("/applications/:id", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM applications WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete application" });
  }
});

// Check MySQL connection and start server
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Connected Successfully!");
    connection.release();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`CareerPilot backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
}

startServer();
