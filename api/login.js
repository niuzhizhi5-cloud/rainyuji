const fs = require('fs');
const jwt = require('jsonwebtoken');

// 与 register.js 完全一致的配置
const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

// 工具函数（与 register.js 保持一致）
function readUsers() {
  // 增加兜底：如果文件不存在，直接返回空结构，避免崩溃
  if (!fs.existsSync(USERS)) {
    return { users: [], nextId: 1 };
  }
  try {
    return JSON.parse(fs.readFileSync(USERS, 'utf8'));
  } catch (e) {
    return { users: [], nextId: 1 };
  }
}

function writeUsers(d) { 
  fs.writeFileSync(USERS, JSON.stringify(d, null, 2)); 
}

function readStats() {
  if (!fs.existsSync(STATS)) {
    return { totalVisits: 0, vipCount: 0, lastUpdate: '' };
  }
  try {
    return JSON.parse(fs.readFileSync(STATS, 'utf8'));
  } catch (e) {
    return { totalVisits: 0, vipCount: 0, lastUpdate: '' };
  }
}

function writeStats(d) { 
  fs.writeFileSync(STATS, JSON.stringify(d, null, 2)); 
}

// 与 register.js 完全一致的加密函数（一个字符都不能改）
function hash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { 
    h = ((h << 5) - h) + pw.charCodeAt(i); 
    h &= h; 
  }
  return h.toString(16) + pw.length;
}

module.exports = (req, res) => {
  // 1. 强制处理 CORS 跨域（解决连接失败的核心）
  // 响应所有预检请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 如果是 OPTIONS 预检请求，直接返回 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '仅支持 POST 请求'
    });
  }

  try {
    // 3. 解析前端传过来的数据
    // 增加 JSON 解析容错
    let body;
    try {
      body = req.body || JSON.parse(req.rawBody || '{}');
    } catch (e) {
      return res.json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    const { username, password } = body;

    // 4. 校验输入
    if (!username || !password) {
      return res.json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 5. 读取用户数据
    const db = readUsers();

    // 6. 查找用户
    const u = db.users.find(x => x.username === username);
    if (!u) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    // 7. 校验密码
    if (u.password !== hash(password)) {
      return res.json({
        success: false,
        message: '密码错误'
      });
    }

    // 8. 更新最后登录时间
    u.last_login = new Date().toISOString();
    writeUsers(db);

    // 9. 更新统计
    const s = readStats();
    s.totalVisits++;
    s.lastUpdate = new Date().toISOString();
    writeStats(s);

    // 10. 生成 Token
    const token = jwt.sign(
      { id: u.id, username, vip_level: u.vip_level },
      SECRET,
      { expiresIn: '7d' }
    );

    // 11. 成功响应
    return res.json({
      success: true,
      message: '登录成功',
      token,
      user: { 
        id: u.id, 
        username, 
        vip_level: u.vip_level 
      }
    });

  } catch (err) {
    // 捕获所有未知错误，防止服务器挂掉
    console.error('登录接口报错:', err);
    return res.json({
      success: false,
      message: '服务器内部错误，请稍后再试'
    });
  }
};
