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
  // 统一处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).end();
  
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: '用户名密码不能为空' });
  }

  try {
    // 从 Redis 读取用户数据
    const db = await redis.get('users_db') || { users: [], nextId: 1 };
    
    if (db.users.find(u => u.username === username)) {
      return res.json({ success: false, message: '用户名已存在' });
    }

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
    
    // 写入 Redis
    await redis.set('users_db', db);

    const s = await redis.get('stats_data') || { totalVisits: 0, vipCount: 0, lastUpdate: '' };
    s.totalVisits++;
    s.lastUpdate = new Date().toISOString();
    await redis.set('stats_data', s);

    const token = jwt.sign({ id: nu.id, username }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: '注册成功', token, user: { id: nu.id, username, vip_level: 0 } });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};
