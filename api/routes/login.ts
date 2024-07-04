import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const defaultMessage = "Login ou senha incorretos";

  if (!email || !password) {
    res.status(400).json({ erro: defaultMessage });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (user == null) {
      res.status(400).json({ erro: defaultMessage });
      return;
    }

    if (bcrypt.compareSync(password, user.password)) {
      console.log('User authenticated:', user);

      const tokenPayload = {
        userLogadoId: user.id,
        userLogadoNome: user.name
      };

      console.log('Token Payload:', tokenPayload);

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      console.log('Generated Token:', token);

      res.status(200).json({
        id: user.id,
        nome: user.name,
        email: user.email,
        token: token
      });
    } else {
      await prisma.log.create({
        data: { 
          desc: "Tentativa de Acesso Inválida", 
          complement: `Funcionário: ${user.email}`,
          userId: user.id
        }
      });

      res.status(400).json({ erro: defaultMessage });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ erro: 'Internal server error' });
  }
});

export default router;
