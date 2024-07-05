import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { verifyToken } from "../middewares/verifyToken";

const prisma = new PrismaClient();

// * Middleware para soft delete que vai fazer com que os registros deletados não sejam removidos do banco de dados, mas sim marcados como deletados.
async function main() {
  /***********************************/
  /* SOFT DELETE MIDDLEWARE */
  /***********************************/
  prisma.$use(async (params, next) => {
    // Check incoming query type
    if (params.model == "Serie") {
      if (params.action == "delete") {
        // Delete queries
        // Change action to an update
        params.action = "update";
        params.args["data"] = { deleted: true };
      }
    }
    return next(params);
  });
}
main();

const router = Router();

// * Rota de listagem de séries
router.get("/", async (req, res) => {
  try {
    const series = await prisma.serie.findMany({
      where: { deleted: false },
    });
    res.status(200).json(series);
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de registro de séries
router.post("/", verifyToken, async (req: any, res) => {
  const { name, streaming, genre, seasons } = req.body;

  // * userLoggedId é o id do usuário logado que está sendo passado pelo middleware verifyToken que é chamado na rota
  const userLoggedId = req.userLoggedId;

  if (!name || !streaming || !genre || !seasons) {
    res.status(400).json({ erro: "Informe nome, streaming, gênero e temporadas" });
    return;
  }

  try {
    const serie = await prisma.serie.create({
      data: { name, streaming,  genre, seasons, userId: userLoggedId },
    });
    
    
    res.status(201).json(serie);
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de exclusão de séries
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const serie = await prisma.serie.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(serie);
  } catch (error) {
    res.status(400).json(error);
  }
});

// * Rota de alteração de séries
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, streaming, genre, seasons } = req.body;

  if (!name || !streaming || !genre || !seasons) {
    res.status(400).json({ erro: "Informe nome, streaming, gênero e temporadas" });
    return;
  }

  try {
    const serie = await prisma.serie.update({
      where: { id: Number(id) },
      data: {
        name,
        streaming,
        genre,
        seasons
      },
    });
    res.status(200).json(serie);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
