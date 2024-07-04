import express from "express";
import dotenv from "dotenv";

const app = express();
const port = 3000;
import cors from "cors";

const crypto = require("crypto");
const secret = crypto.randomBytes(64).toString("hex");
console.log(secret);

dotenv.config();

import seriesRoutes from "./routes/series";
import loginRoutes from "./routes/login";
import registerRoutes from "./routes/register";

app.use(express.json());
app.use(cors());
app.use("/music", seriesRoutes);
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);

app.get("/", (req, res) => {
  res.send("API DE MUSICAS E USUARIOS");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
