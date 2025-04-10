const express = require("express");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SECRET_KEY = "secretkey"; // Ganti dengan secret key yang lebih aman untuk production

// Konfigurasi Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Login Sederhana",
      version: "1.0.0",
      description: "API untuk login dengan JWT token",
    },
    servers: [{ url: `http://103.176.78.24:${PORT}` }],
  },
  apis: ["./app.js"], // File yang berisi dokumentasi Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user dan mendapatkan JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Username atau password salah
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Pengecekan kredensial sederhana (contoh, hardcode)
  if (username === "admin" && password === "admin") {
    // Membuat token JWT dengan masa berlaku 1 jam
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Username atau password salah" });
});

// Middleware untuk memverifikasi token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token tidak valid" });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(403).json({ message: "Token tidak ditemukan" });
  }
};

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Endpoint yang hanya dapat diakses dengan JWT token yang valid
 *     tags:
 *       - Protected
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akses berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Akses ditolak
 */
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: `Selamat datang ${req.user.username}, Anda telah mengakses endpoint yang terlindungi.`,
  });
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
