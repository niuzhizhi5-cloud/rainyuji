const fs = require('fs');
const jwt = require('jsonwebtoken');

const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

// 和 register.js 保持一致
function readUsers() { return JSON.parse(fs.readFileSync(USERS)) }
function writeUsers(d) { fs.writeFileSync(USERS, JSON.stringify(d)) }
function readStats() { return JSON.parse(fs.readFileSync(STATS)) }
function writeStats(d) { fs.writeFileSync(STATS, JSON.stringify(d)) }

// 和 register.js 里的 hash 函数完全一致
function hash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i);
    h &= h;
  }
  return h.toString(16) + pw.length;
}

module.exports = (req, res) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const db = readUsers();
  const hashedPassword = hash(password);
  const user = db.users.find(u => u.username === username && u.password === hashedPassword);

  if (!user) {
    return res.json({ success: false, message: '用户不存在' });
  }

  // 更新最后登录时间
  user.last_login = new Date().toISOString();
  writeUsers(db);

  // 更新统计
  const s = readStats();
  s.totalVisits++;
  s.lastUpdate = new Date().toISOString();
  writeStats(s);

  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '7d' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    success: true,
    message: '登录成功',
    token,
    user: { id: user.id, username, vip_level: user.vip_level }
  });
};
