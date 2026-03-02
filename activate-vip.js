const fs = require('fs');
const jwt = require('jsonwebtoken');
const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';
const SECRET = 'rain-secret-key-2026';

const VIP = {
  '月-52f2885bc2': { level: 1, type: 'month', name: '月卡VIP' },
  '季-265d4d300b': { level: 2, type: 'season', name: '季卡VIP' },
  '年-d4de26cf64': { level: 3, type: 'year', name: '年卡VIP' }
};

module.exports = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).end();

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).end();
    const { code } = req.body;
    const v = VIP[code];
    if (!v) return res.json({ success: false, message: '激活码无效' });

    const db = JSON.parse(fs.readFileSync(USERS));
    const u = db.users.find(x => x.id === user.id);
    if (!u) return res.json({ success: false });

    u.vip_level = v.level;
    u.vip_type = v.type;
    u.vip_activated_at = new Date().toISOString();
    fs.writeFileSync(USERS, JSON.stringify(db));

    const s = JSON.parse(fs.readFileSync(STATS));
    s.vipCount = db.users.filter(x => x.vip_level > 0).length;
    s.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATS, JSON.stringify(s));

    res.json({ success: true, message: 'VIP激活成功', vip_level: v.level });
  });
};
