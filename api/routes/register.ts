import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json(error)
  }
})

function validatePassword(password: string) {

  const message: string[] = []

  if (password.length < 8) {
    message.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  let lowercase = 0
  let uppercase = 0
  let numbers = 0
  let simbols = 0


  for (const letter of password) {
    if ((/[a-z]/).test(letter)) {
      lowercase++
    }
    else if ((/[A-Z]/).test(letter)) {
      uppercase++
    }
    else if ((/[0-9]/).test(letter)) {
      numbers++
    } else {
      simbols++
    }
  }

  if (lowercase == 0 || uppercase == 0 || numbers == 0 || simbols == 0) {
    message.push("Erro... senha deve possuir letters minúsculas, maiúsculas, números e símbolos")
  }

  return message
}

// * Rota de cadastro de usuário, validando a senha e impedindo o cadastro de 2 usuários com o mesmo e-mail.
router.post("/", async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400).json({ erro: "Informe nome, email e senha" })
    return
  }

  const user = await prisma.user.findFirst({
    where: { email: email }
  })

  if (user != null) {
    res.status(400).json({ erro: "Email já cadastrado" })
    return
  }

  const errors = validatePassword(password)
  if (errors.length > 0) {
    res.status(400).json({ erro: errors.join("; ") })
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(password, salt)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hash }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})



// * Implementar rotina de alteração de senha do usuário, validando a senha atual e criptografando a nova senha.
router.put("/changePassword", async (req, res) => {
  const { email, password, newPassword } = req.body

  if (!email || !password) {
    res.status(400).json({ erro: "Informe email e senha" })
    return
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: email }
  })

  if (existingUser == null) {
    res.status(400).json({ erro: "Usurário inexistente" })
    return
  }

  const errors = validatePassword(password)
  if (errors.length > 0) {
    res.status(400).json({ erro: errors.join("; ") })
    return
  }

  if(!bcrypt.compareSync(password, existingUser.password)) {
    res.status(400).json({ erro: "Senha atual incorreta" })
    return
  }

  let errorsNewPassword = validatePassword(newPassword)
  if (errorsNewPassword.length > 0) {
    res.status(400).json({ erro: errorsNewPassword.join("; ") })
    errorsNewPassword = []
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(newPassword, salt)

  try {
    const user = await prisma.user.update({
      where: { id: existingUser.id }, 
      data: { email, password: hash }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }

})


export default router