import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env para process.env

import jwt from "jsonwebtoken"; 
import { PrismaClient } from "@prisma/client"; 
import { Router } from "express"; 
import bcrypt from 'bcrypt'; 

const prisma = new PrismaClient();
const router = Router(); 

// Define o número máximo de tentativas de login permitidas
const MAX_LOGIN_ATTEMPTS = 3; 
// Define o tempo de bloqueio em milissegundos (1 hora)
const LOCK_TIME = 1 * 60 * 60 * 10; 

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

    // Verifica se a conta está bloqueada 
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(403).json({ erro: "Conta bloqueada. Tente novamente mais tarde." });
      return;
    }

  
    if (bcrypt.compareSync(password, user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockUntil: null
        }
      });

      // Cria o payload do token
      const tokenPayload = {
        userLoggedId: user.id,
        userLoggedName: user.name
      }; 

      
      // Gera o token JWT
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      ); 


      res.status(200).json({
        id: user.id,
        nome: user.name,
        email: user.email,
        token: token
      }); 
    } else {
      // Incrementa as tentativas de login e bloqueia a conta se necessário
      let loginAttempts = user.loginAttempts + 1;
      let lockUntil = user.lockUntil;

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCK_TIME);
        loginAttempts = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: loginAttempts,
          lockUntil: lockUntil
        }
      });

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