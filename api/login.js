const { Redis } = require('@upstash/redis');
const jwt = require('jsonwebtoken');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const SECRET = 'rain-secret-key-2026';

function hash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i);
    h &= h;
  }
  return h.toString(16) + pw.length;
}

module.exports = async (req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  
  // 从 Redis 读取用户数据
  const db = await redis.get('users_db') || { users: [], nextId: 1 };
  const u = db.users.find(x => x.username === username);

  if (!u) return res.json({ success: false, message: '用户不存在' });
  if (u.password !== hash(password)) return res.json({ success: false, message: '密码错误' });

  u.last_login = new Date().toISOString();
  await redis.set('users_db', db);

  const s = await redis.get('stats_data') || { totalVisits: 0, vipCount: 0, lastUpdate: '' };
  s.totalVisits++;
  s.lastUpdate = new Date().toISOString();
  await redis.set('stats_data', s);

  const token = jwt.sign({ id: u.id, username }, SECRET, { expiresIn: '7d' });
  res.json({ success: true, message: '登录成功', token, user: { id: u.id, username, vip_level: u.vip_level } });
};
