import express from "express";
import dotenv from "dotenv";

const app = express();
const port = 3000;
import cors from "cors";

dotenv.config();

import seriesRoutes from "./routes/series";
import loginRoutes from "./routes/login";
import registerRoutes from "./routes/register";
import usersRoutes from "./routes/user";
import logRoutes from "./routes/log";



app.use(express.json());
app.use(cors());
app.use("/series", seriesRoutes);
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/user", usersRoutes);
app.use("/log", logRoutes);

app.get("/", (req, res) => {
  res.send("API DE SERIES E USUARIOS");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});


