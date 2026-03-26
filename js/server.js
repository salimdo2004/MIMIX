// 1️⃣ Imports
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 2️⃣ Initialisation
const app = express();
const SECRET = "mysecretkey";

app.use(cors());
app.use(express.json());

// 3️⃣ Test PostgreSQL
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Connexion PostgreSQL réussie",
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur connexion DB");
  }
});

// 4️⃣ REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.json(user.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// 5️⃣ LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if (user.rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
    );

    if (!validPassword) {
        return res.status(401).json({ error: "Password incorrect" });
    }

    const token = jwt.sign(
        { id: user.rows[0].id_user },
        SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

// 6️⃣ Lancer serveur
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

