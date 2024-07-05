import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env para process.env

import jwt from "jsonwebtoken"; // Importa a biblioteca jsonwebtoken para criar tokens JWT
import { PrismaClient } from "@prisma/client"; // Importa o cliente Prisma para interagir com o banco de dados
import { Router } from "express"; // Importa o roteador do Express para definir rotas
import bcrypt from 'bcrypt'; // Importa a biblioteca bcrypt para hashing de senhas

const prisma = new PrismaClient(); // Cria uma instância do cliente Prisma
const router = Router(); // Cria uma instância do roteador do Express

const MAX_LOGIN_ATTEMPTS = 3; // Define o número máximo de tentativas de login permitidas
const LOCK_TIME = 1 * 60 * 60 * 10; // Define o tempo de bloqueio em milissegundos (1 hora)

router.post("/", async (req, res) => {
  const { email, password } = req.body; // Extrai email e senha do corpo da requisição

  const defaultMessage = "Login ou senha incorretos"; // Mensagem padrão de erro

  if (!email || !password) { // Verifica se o email ou senha estão ausentes
    res.status(400).json({ erro: defaultMessage });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email }
    }); // Busca o usuário pelo email no banco de dados

    if (user == null) { // Se o usuário não for encontrado
      res.status(400).json({ erro: defaultMessage });
      return;
    }

    // Verifica se a conta está bloqueada
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(403).json({ erro: "Conta bloqueada. Tente novamente mais tarde." });
      return;
    }

    // Verifica se a senha está correta
    if (bcrypt.compareSync(password, user.password)) {
      console.log('User authenticated:', user);

      // Reseta as tentativas de login e desbloqueia a conta, se necessário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockUntil: null
        }
      });

      const tokenPayload = {
        userLogadoId: user.id,
        userLogadoNome: user.name
      }; // Cria o payload do token

      console.log('Token Payload:', tokenPayload);

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      ); // Gera o token JWT

      console.log('Generated Token:', token);

      res.status(200).json({
        id: user.id,
        nome: user.name,
        email: user.email,
        token: token
      }); // Retorna o token e informações do usuário
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
      }); // Cria um log de tentativa de acesso inválida

      res.status(400).json({ erro: defaultMessage });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ erro: 'Internal server error' }); // Lida com erros durante o login
  }
});

export default router; // Exporta o roteador para uso em outras partes da aplicação
