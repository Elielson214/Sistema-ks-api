const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      'chave_secreta_supersegura',
      { expiresIn: '8h' }
    );
    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});