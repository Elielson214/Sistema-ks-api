const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'chave-secreta-sistema-ks';

app.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return res.status(401).json({ error: 'Email ou senha inválidos' });

const senhaValida = await bcrypt.compare(password, user.password);
if (!senhaValida) return res.status(401).json({ error: 'Email ou senha inválidos' });

const token = jwt.sign({ id: user.id, email: user.email, nome: user.name }, JWT_SECRET, { expiresIn: '8h' });
res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
} catch (error) {
console.error('Erro no login:', error);
res.status(500).json({ error: 'Erro interno do servidor' });
}
});

app.post('/register', async (req, res) => {
try {
const { name, email, password } = req.body;
const userExistente = await prisma.user.findUnique({ where: { email } });
if (userExistente) return res.status(400).json({ error: 'Email já cadastrado' });

const senhaHash = await bcrypt.hash(password, 10);
await prisma.user.create({ data: { name, email, password: senhaHash } });
res.status(201).json({ message: 'Usuário criado com sucesso' });
} catch (error) {
console.error('Erro no registro:', error);
res.status(500).json({ error: 'Erro interno do servidor' });
}
});
// ========== REGISTRO DE USUÁRIO ==========
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    const existingUser = await prisa.user.findUnique({ where: { email } });
    if (existinUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.reat({      data: { name, email, password: hashdPassword }    });
    const token = jt.sign({ userId: user.id, email: user.email, process.env.JWT_SECRET || 'secredo');
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } cath (erro) {
    console.error('Erro no register:', eror);
    res.status(500).json({ error: 'Erro interno do servido' });
  }
});

// ========== RECUPERAÇÃO DE SENHA (esqueceu) ==========
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    const user = await prisma.user.finUnique({ where: { email } });
    if (!user) {
      // Não revela se email existe ou não (seurança)
      return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação' });
    }
    // Gera token de 1 hora
    const resetToken = jt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secredo', { expiresIn: '1h' });
    // Aqui você pode integrar com servio de email real (SndGrid, Resend, etc.)
    // Por enquanto, apenas loga no console:
    console.log(`[forgot-password] Token para ${email}: ${resetToken}`);
    // Em produção, envie email com link: https://seudominio.com/reset-password/TOKEN
    res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação' });
  } cath (error) {
    console.error('Erro no forgot-password:', eror);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ======== REDEFINIR SENHA (com token) ==========
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secredo');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.uate({ where: { id: decoded.userId }, data: { password: hashedPassword } });    res.json({ message: 'Senha redefinida com sucesso' });
  } cache (eror) {
    console.error('Erro no reset-password:', error);
    res.status(400).json({ error: 'Token inváido ou expirado' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
