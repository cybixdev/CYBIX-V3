require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const JSZip = require('jszip');
const uuid = require('uuid');
const moment = require('moment');

const app = express();
app.use(cors());
app.use(express.json());

// --- In-memory DB (swap for a real DB in production) ---
const users = {};
const codes = {};
const premium = {};
const stats = { registrations: 0 };

// --- JWT Auth ---
function genToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
    admin: user.admin,
    premium: user.premium
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Admin Bootstrap ---
if (!users[process.env.ADMIN_EMAIL]) {
  users[process.env.ADMIN_EMAIL] = {
    id: uuid.v4(),
    name: "Admin",
    username: "admin",
    email: process.env.ADMIN_EMAIL,
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    premium: true,
    admin: true,
    created: moment().toISOString()
  };
}

// --- User Endpoints ---
app.post('/user/check', (req, res) => {
  const { email } = req.body;
  return res.json({ exists: !!users[email] });
});

app.post('/user/signup', (req, res) => {
  const { name, username, email, password, code } = req.body;
  if (users[email]) return res.status(400).json({ error: 'Email exists' });
  if (!codes[email] || codes[email].code !== code || moment().isAfter(codes[email].expires)) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  users[email] = {
    id: uuid.v4(),
    name,
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    premium: false,
    admin: false,
    created: moment().toISOString()
  };
  stats.registrations += 1;
  delete codes[email];
  const token = genToken(users[email]);
  return res.json({ token, user: { ...users[email], password: undefined } });
});

app.post('/user/login', (req, res) => {
  const { identifier, password } = req.body;
  const user = Object.values(users).find(u =>
    u.email === identifier || u.username === identifier || u.name === identifier
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Wrong password' });
  const token = genToken(user);
  return res.json({ token, user: { ...user, password: undefined } });
});

app.post('/user/reset', (req, res) => {
  const { email, password, code } = req.body;
  if (!users[email]) return res.status(404).json({ error: 'User not found' });
  if (!codes[email] || codes[email].code !== code || moment().isAfter(codes[email].expires)) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  users[email].password = bcrypt.hashSync(password, 10);
  delete codes[email];
  return res.json({ ok: true });
});

// --- Telegram Bot Integration ---
app.post('/telegram/code', (req, res) => {
  const { email, code, type } = req.body;
  codes[email] = {
    code,
    expires: moment().add(3, 'minutes'),
    type
  };
  return res.json({ ok: true });
});

// --- Premium Management ---
app.post('/admin/add-premium', (req, res) => {
  const { email } = req.body;
  if (!users[email]) return res.status(404).json({ error: 'User not found' });
  users[email].premium = true;
  premium[email] = { expires: moment().add(1, 'month').toISOString() };
  return res.json({ ok: true });
});
setInterval(() => {
  Object.entries(premium).forEach(([email, value]) => {
    if (moment().isAfter(value.expires)) {
      if (users[email]) users[email].premium = false;
      delete premium[email];
    }
  });
}, 3600 * 1000);

// --- Code Obfuscation/Deobfuscation ---
function obfuscate(code, lang, type, repeats) {
  let result = code;
  for (let i = 0; i < (repeats || 1); i++) {
    result = Buffer.from(result).toString('base64');
  }
  return `// CYBIX TECH Obfuscated (${lang}, type: ${type}, repeats: ${repeats})\n${result}`;
}
function deobfuscate(code, lang, type, repeats) {
  let result = code.replace(/\/\/ CYBIX TECH Obfuscated.*\n/, '');
  for (let i = 0; i < (repeats || 1); i++) {
    result = Buffer.from(result, 'base64').toString('utf8');
  }
  return result;
}
function detectLang(filename, content) {
  const ext = filename.split('.').pop();
  const mapping = { js: 'javascript', py: 'python', html: 'html', css: 'css', jsx: 'react', ts: 'typescript', java: 'java' };
  if (mapping[ext]) return mapping[ext];
  if (content.includes('def ') && content.includes('import ')) return 'python';
  if (content.includes('<html')) return 'html';
  if (content.includes('function ')) return 'javascript';
  return 'unknown';
}
app.post('/code/obfuscate', auth, (req, res) => {
  const { code, type, repeats, lang } = req.body;
  if (!code || !lang) return res.status(400).json({ error: 'Missing code or lang' });
  return res.json({ result: obfuscate(code, lang, type, repeats || 1) });
});
app.post('/code/deobfuscate', auth, (req, res) => {
  const { code, type, repeats, lang } = req.body;
  if (!code || !lang) return res.status(400).json({ error: 'Missing code or lang' });
  return res.json({ result: deobfuscate(code, lang, type, repeats || 1) });
});

// --- Upload ZIP (premium only) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', auth, upload.single('zip'), async (req, res) => {
  if (!req.user.premium) return res.status(403).json({ error: 'Premium only' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const zip = new JSZip();
  await zip.loadAsync(req.file.buffer);
  const outZip = new JSZip();
  for (const filename of Object.keys(zip.files)) {
    const f = zip.files[filename];
    const code = await f.async('string');
    const lang = detectLang(filename, code);
    const obfuscated = obfuscate(code, lang, 'default', 1);
    outZip.file(filename, obfuscated);
  }
  const outBuffer = await outZip.generateAsync({ type: 'nodebuffer' });
  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', 'attachment; filename=obfuscated.zip');
  return res.send(outBuffer);
});

// --- Admin dashboard ---
app.get('/admin/dashboard', auth, (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'Admin only' });
  const usersList = Object.values(users).map(u => ({
    name: u.name, username: u.username, email: u.email, premium: u.premium, created: u.created
  }));
  return res.json({
    stats,
    users: usersList,
    premium: Object.keys(premium).length,
    year: moment().year()
  });
});

// --- Health check ---
app.get('/', (req, res) => res.json({ ok: true, name: "CYBIX TECH API" }));

app.listen(process.env.PORT || 3001, () => console.log('CYBIX TECH API running'));
module.exports = app;