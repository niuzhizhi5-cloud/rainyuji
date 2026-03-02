const fs = require('fs');
const USERS = '/tmp/users.json';
const STATS = '/tmp/stats.json';

module.exports = (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS));
  const stats = JSON.parse(fs.readFileSync(STATS));

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rain 后台</title>
<style>
body{font-family:system-ui;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);margin:0;padding:20px;min-height:100vh}
.container{max-width:1000px;margin:0 auto}
.card{background:rgba(255,255,255,0.95);border-radius:16px;padding:20px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.number{font-size:28px;font-weight:bold;color:#667eea}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden}
th,td{padding:12px;text-align:left}
th{background:#f3f4f6}
td{border-bottom:1px solid #eee}
.vip{background:#ff2e63;color:#fff;padding:4px 8px;border-radius:12px;font-size:12px}
</style>
</head>
<body>
<div class="container">
<div class="card"><h1>Rain 管理后台</h1></div>
<div class="grid">
<div class="card"><h3>总用户</h3><div class="number">${users.users.length}</div></div>
<div class="card"><h3>VIP</h3><div class="number">${stats.vipCount}</div></div>
<div class="card"><h3>访问</h3><div class="number">${stats.totalVisits}</div></div>
<div class="card"><h3>更新</h3><div style="font-size:16px">${new Date(stats.lastUpdate).toLocaleString()}</div></div>
</div>
<table>
<tr><th>ID</th><th>用户名</th><th>VIP</th><th>注册时间</th></tr>
${users.users.map(u => `
<tr>
<td>${u.id}</td>
<td>${u.username}</td>
<td><span class="vip">${u.vip_level>0 ? 'VIP'+u.vip_level : '普通'}</span></td>
<td>${new Date(u.created_at).toLocaleString()}</td>
</tr>
`).join('')}
</table>
</div>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};
