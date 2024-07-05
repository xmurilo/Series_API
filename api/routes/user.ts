import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();


router.get("/", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json(error);
    }
  });

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await prisma.user.delete({
        where: { id: Number(id) },
      });
      res.status(200).json("Usuario deletado com sucesso!");
    } catch (error) {
      res.status(400).json(error);
    }
    
  });


export default router;  // Exporta o roteador para uso em outras partes da aplicação