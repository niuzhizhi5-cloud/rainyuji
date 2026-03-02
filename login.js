const fs = require('fs');
const jwt = require('jsonwebtoken');

const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

function readUsers() { return JSON.parse(fs.readFileSync(USERS)) }
function writeUsers(d) { fs.writeFileSync(USERS, JSON.stringify(d)) }
function readStats() { return JSON.parse(fs.readFileSync(STATS)) }
function writeStats(d) { fs.writeFileSync(STATS, JSON.stringify(d)) }

function hash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h &= h; }
  return h.toString(16) + pw.length;
}

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  const db = readUsers();
  const u = db.users.find(x => x.username === username);

  if (!u) return res.json({ success: false, message: '用户不存在' });
  if (u.password !== hash(password)) return res.json({ success: false, message: '密码错误' });

  u.last_login = new Date().toISOString();
  writeUsers(db);

  const s = readStats();
  s.totalVisits++;
  s.lastUpdate = new Date().toISOString();
  writeStats(s);

  const token = jwt.sign({ id: u.id, username }, SECRET, { expiresIn: '7d' });
  res.json({ success: true, message: '登录成功', token, user: { id: u.id, username, vip_level: u.vip_level } });
};
