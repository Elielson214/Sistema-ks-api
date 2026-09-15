const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
host: 'localhost',
port: 5432,
database: 'agenciaks',
user: 'postgres',
password: '110221',
});

app.post('/login', async (req, res) => {
try {
const { email, senha } = req.body;
const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
if (result.rows.length === 0) {
return res.status(401).json({ error: 'Credenciais inválidas' });
}
const usuario = result.rows[0];
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