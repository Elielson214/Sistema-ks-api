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

// Rota de login
app.post('/login', async (req, res) => {
try {
const { email, password } = req.body;

const user = await prisma.user.findUnique({
where: { email }
});

if (!user) {
return res.status(401).json({ error: 'Email ou senha inválidos' });
}

const senhaValida = await bcrypt.compare(password, user.password);
if (!senhaValida) {
return res.status(401).json({ error: 'Email ou senha inválidos' });
}

const token = jwt.sign(
{ id: user.id, email: user.email, nome: user.name },
JWT_SECRET,
{ expiresIn: '8h' }
);

res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
} catch (error) {
console.error('Erro no login:', error);
res.status(500).json({ error: 'Erro interno do servidor' });
}
});

// Rota de registro (para criar o primeiro usuário)
app.post('/register', async (req, res) => {
try {
const { name, email, password } = req.body;

const userExistente = await prisma.user.findUnique({ where: { email } });
if (userExistente) {
return res.status(400).json({ error: 'Email já cadastrado' });
}

const senhaHash = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
data: { name, email, password: senhaHash }
});

res.status(201).json({ message: 'Usuário criado com sucesso' });
} catch (error) {
console.error('Erro no registro:', error);
res.status(500).json({ error: 'Erro interno do servidor' });
}
});

app.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT}`);
});
```

E o `prisma/schema.prisma` deve ser este:

```prisma
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "sqlite"
url = "file:./ks.db"
}

model User {
id Int @id @default(autoincrement())
name String
email String @unique
password String
}
