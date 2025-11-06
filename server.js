import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = new Database(path.join(__dirname, 'users.db'));

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/api/health', (_req, res) => res.json({ ok: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Campos requeridos' });
  if (password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  const emailNorm = String(email).trim().toLowerCase();
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    stmt.run(name.trim(), emailNorm, hash);
    return res.status(201).json({ message: 'Usuario creado' });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ message: 'El correo ya está registrado' });
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Campos requeridos' });
  const emailNorm = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(emailNorm);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
  const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));


