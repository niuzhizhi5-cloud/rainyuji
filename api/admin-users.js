const fs = require('fs');
const USERS = '/tmp/users.json';

module.exports = (req, res) => {
  const db = JSON.parse(fs.readFileSync(USERS));
  res.json({
    success: true,
    users: db.users.map(u => ({
      id: u.id, username: u.username, email: u.email,
      vip_level: u.vip_level, created_at: u.created_at
    }))
  });
};
