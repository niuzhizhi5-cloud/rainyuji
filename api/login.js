const fs = require('fs');
const jwt = require('jsonwebtoken');

const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

// 和 register.js 完全一致
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
    h = ((h << 5) - h) + pw.charCodeAt(i);
    h &= h;
  }
  return h.toString(16) + pw.length;
}

module.exports = (req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();

  // 👇 加上这一行，登录前先初始化，确保文件存在
  init();

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
