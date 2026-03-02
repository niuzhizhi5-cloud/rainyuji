const fs = require('fs');
const jwt = require('jsonwebtoken');

const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

function init() {
  if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, JSON.stringify({ users: [], nextId: 1 }));
  if (!fs.existsSync(STATS)) fs.writeFileSync(STATS, JSON.stringify({ totalVisits: 0, vipCount: 0, lastUpdate: '' }));
}

function readUsers() { return JSON.parse(fs.readFileSync(USERS)) }
function writeUsers(d) { fs.writeFileSync(USERS, JSON.stringify(d)) }
function readStats() { return JSON.parse(fs.readFileSync(STATS)) }
function writeStats(d) { fs.writeFileSync(STATS, JSON.stringify(d)) }

function hash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i); h &= h;
  }
  return h.toString(16) + pw.length;
}

init();

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password, email } = req.body;

  if (!username || !password) return res.json({ success: false, message: '用户名密码不能为空' });
  const db = readUsers();
  if (db.users.find(u => u.username === username)) return res.json({ success: false, message: '用户名已存在' });

  const nu = {
    id: db.nextId,
    username,
    password: hash(password),
    email: email || '',
    vip_level: 0,
    vip_type: null,
    created_at: new Date().toISOString(),
    last_login: null
  };

  db.users.push(nu);
  db.nextId++;
  writeUsers(db);

  const s = readStats();
  s.totalVisits++;
  s.lastUpdate = new Date().toISOString();
  writeStats(s);

  const token = jwt.sign({ id: nu.id, username }, SECRET, { expiresIn: '7d' });
  res.json({ success: true, message: '注册成功', token, user: { id: nu.id, username, vip_level: 0 } });
};
