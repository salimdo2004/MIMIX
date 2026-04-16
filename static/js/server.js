const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET = "mysecretkey";

app.use(cors());
app.use(express.json());

// TEST DB
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

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // ✅ Vérification des champs
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: "Tous les champs sont obligatoires"
      });
    }

    // ✅ Vérifier si user existe déjà
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({
        error: "Email déjà utilisé"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ INSERT CORRECT (4 params = 4 valeurs)
    const user = await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, hashedPassword]
    );

    res.json(user.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
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
      { id: user.rows[0].id_user, 
        role: user.rows[0].role
      },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});
// verfication de  role
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ error: "Token requis" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // ✅ contient id + role
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

const isTrainer = (req, res, next) => {
  if (req.user.role !== "trainer") {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
};

// START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});