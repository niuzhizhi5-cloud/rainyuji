const fs = require('fs');
const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';

module.exports = (req, res) => {
  const db = JSON.parse(fs.readFileSync(USERS));
  const stats = JSON.parse(fs.readFileSync(STATS));
  res.json({
    success: true,
    stats: {
      totalUsers: db.users.length,
      vipCount: db.users.filter(u => u.vip_level > 0).length,
      totalVisits: stats.totalVisits,
      lastUpdate: stats.lastUpdate
    }
  });
};
