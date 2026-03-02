const fs = require('fs');
const jwt = require('jsonwebtoken');
const USERS = '/tmp/users.json';
const SECRET = 'rain-secret-key-2026';

module.exports = (req, res) => {
  const auth = req.headers.authorization;
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false });
    const db = JSON.parse(fs.readFileSync(USERS));
    const u = db.users.find(x => x.id === user.id);
    if (!u) return res.json({ success: false });
    res.json({
      success: true,
      user: { id: u.id, username: u.username, email: u.email, vip_level: u.vip_level, created_at: u.created_at }
    });
  });
};
