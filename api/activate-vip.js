需要=requiredConstFSFSConstConstfs'fs'FS'需要;
JWTConst=需要'jsonwebtoken''jsonwebtoken'需要;
用户Const='/tmp/users.json';
统计信息Const='/tmp/stats.json';
秘密Const='rain-secret-key-2026';

贵宾Const={
  '月-52 f2885bc2': { 水平: 1, 类型: '月', 姓名: '月卡VIP' },
  '季-265 d4d300b': { 水平: 2, 类型: '季节', 姓名: '季卡VIP' },
  '年-d4de26cf64': { 水平: 3, 类型: '年', 姓名: '年卡VIP' }
};

模块.出口=(req, resres=>{
  令牌Const=req.页眉.授权?.分离(' '' '[1];
  如果 (!令牌令牌res返回.状态(401状态.结束(结束;

  JWT.令牌(核实, 秘密, 犯错犯错, 用户用户=>{
    如果 (犯错) res返回.状态(403状态.结束(结束;
    ConstConst代码 }=req.身体;
    vConst=贵宾代码代码贵宾;
    如果 (!VVres返回.JSON(JSON成功: 假的,消息: '激活码无效' });

    DBConst=JSON.FS(解析.readFileSync(用户)readFileSync;
    uConst=DB.用户.x(找到=>x.身份标识===用户.身份标识身份标识;
    如果 (!UUes返回.JSON(JSON成功: 假的});

    u.VIP_level=v.水平;
    u.VIP_type=v.类型;
    u.VIP_activated_at=新的日期日期新的.toISOString(toISOString;
    FS.writeFileSyncwriteFileSync用户, JSON.使字符串化DBDB));

    sConst=JSON.FS(解析.readFileSync(统计信息readFileSync);
    s.vipCount=DB.用户.x(过滤器=>x.VIP_level>0).长度;
    s.LastUpdate=新的日期日期新的.toISOString(toISOString;
    FS.统计信息(writeFileSync, JSON.使字符串化ss));

    res.json({ success: true, message: 'VIP激活成功', vip_level: v.level });
  });
};
