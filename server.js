const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { JsonDB, Config } = require("node-json-db");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 托管静态文件（前端页面）
app.use(express.static(__dirname));

// JSON 数据库
const db = new JsonDB(new Config("db", true, false, "/"));

// 管理员邮箱
const ADMIN_EMAIL = "a13128283441@163.com";

// 验证码临时存储（内存，key=邮箱，value={code, expireAt}）
const verifyCodes = new Map();

// 163 邮箱 SMTP 配置（授权码从环境变量 SMTP_PASS 读取）
const transporter = nodemailer.createTransport({
  host: "smtp.163.com",
  port: 465,
  secure: true,
  auth: {
    user: "a13128283441@163.com",
    pass: process.env.SMTP_PASS
  }
});

// 初始化数据库默认结构
async function initDB() {
  try { await db.getData("/userList"); } catch { await db.push("/userList", []); }
  try { await db.getData("/applyList"); } catch { await db.push("/applyList", []); }
  try { await db.getData("/newsList"); } catch { await db.push("/newsList", []); }
  try { await db.getData("/boxData"); } catch { await db.push("/boxData", []); }
}
initDB();

// ========== 验证码 ==========
app.post("/api/sendCode", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ code: 400, msg: "邮箱不能为空" });

  // 生成6位数字验证码
  const code = String(Math.floor(100000 + Math.random() * 900000));
  // 有效期10分钟
  verifyCodes.set(email, { code, expireAt: Date.now() + 10 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: '"丐帮" <a13128283441@163.com>',
      to: email,
      subject: "【丐帮】注册验证码",
      html: `
        <div style="font-family:微软雅黑,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#111;border:2px solid #ffd700;border-radius:10px;color:#fff;">
          <h2 style="color:#ffd700;text-align:center;margin:0 0 20px;">丐帮注册验证码</h2>
          <p style="font-size:16px;line-height:1.8;">大侠您好，</p>
          <p style="font-size:16px;line-height:1.8;">您正在注册丐帮账号，验证码如下：</p>
          <div style="text-align:center;margin:30px 0;">
            <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:8px;color:#ffd700;background:#222;padding:15px 40px;border-radius:8px;border:1px solid #ffd700;">${code}</span>
          </div>
          <p style="font-size:14px;color:#999;line-height:1.6;">验证码有效期为10分钟，请勿泄露给他人。<br>如非本人操作，请忽略此邮件。</p>
          <p style="text-align:center;color:#666;font-size:12px;margin-top:30px;">© 2026 丐帮 | 版权所有</p>
        </div>
      `
    });
    res.json({ code: 200, msg: "验证码已发送，请查收邮箱" });
  } catch (err) {
    console.error("邮件发送失败：", err);
    verifyCodes.delete(email);
    res.json({ code: 500, msg: "验证码发送失败，请稍后重试" });
  }
});

// ========== 注册（带验证码校验） ==========
app.post("/api/register", async (req, res) => {
  const { email, password, code } = req.body;
  if (!email || !password || !code) return res.json({ code: 400, msg: "邮箱、密码、验证码不能为空" });

  // 校验验证码
  const record = verifyCodes.get(email);
  if (!record) return res.json({ code: 400, msg: "请先获取验证码" });
  if (Date.now() > record.expireAt) {
    verifyCodes.delete(email);
    return res.json({ code: 400, msg: "验证码已过期，请重新获取" });
  }
  if (record.code !== code) return res.json({ code: 400, msg: "验证码错误" });

  // 检查邮箱是否已注册
  const userData = await db.getData("/userList");
  const existUser = userData.find(item => item.email === email);
  if (existUser) return res.json({ code: 400, msg: "该邮箱已注册" });

  userData.push({ email, password, createTime: new Date().toLocaleString() });
  await db.push("/userList", userData, true);

  // 注册成功后删除验证码
  verifyCodes.delete(email);
  res.json({ code: 200, msg: "注册成功，请登录" });
});

// ========== 登录 ==========
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const userData = await db.getData("/userList");
  const targetUser = userData.find(item => item.email === email && item.password === password);
  if (!targetUser) return res.json({ code: 400, msg: "邮箱或密码错误" });
  res.json({ code: 200, msg: "登录成功", data: { email } });
});

// ========== 入帮申请 ==========
app.post("/api/submitApply", async (req, res) => {
  const { email, name, school, grade, className } = req.body;
  let applyData = await db.getData("/applyList");
  const index = applyData.findIndex(item => item.email === email);
  const applyInfo = {
    email, name, school, grade, className,
    status: "pending",
    createTime: new Date().toLocaleString()
  };
  index > -1 ? applyData[index] = applyInfo : applyData.push(applyInfo);
  await db.push("/applyList", applyData, true);
  res.json({ code: 200, msg: "申请提交成功，等待管理员审核" });
});

app.get("/api/getMyApply", async (req, res) => {
  const { email } = req.query;
  const applyData = await db.getData("/applyList");
  const myApply = applyData.find(item => item.email === email);
  res.json({ code: 200, data: myApply || null });
});

// ========== 管理员：申请审核 ==========
app.get("/api/admin/getAllApply", async (req, res) => {
  const { adminEmail } = req.query;
  if (adminEmail !== ADMIN_EMAIL) return res.json({ code: 403, msg: "无管理员权限" });
  let applyData = await db.getData("/applyList");
  applyData = applyData.filter(item => item.email !== ADMIN_EMAIL);
  res.json({ code: 200, data: applyData });
});

app.post("/api/admin/updateApply", async (req, res) => {
  const { adminEmail, targetEmail, newStatus } = req.body;
  if (adminEmail !== ADMIN_EMAIL) return res.json({ code: 403, msg: "无管理员权限" });
  let applyData = await db.getData("/applyList");
  const target = applyData.find(item => item.email === targetEmail);
  if (!target) return res.json({ code: 404, msg: "未找到该申请记录" });
  target.status = newStatus;
  await db.push("/applyList", applyData, true);
  res.json({ code: 200, msg: "审核状态已更新" });
});

// ========== 新闻 ==========
app.get("/api/news", async (req, res) => {
  const newsList = await db.getData("/newsList");
  res.json({ code: 200, data: newsList });
});

app.post("/api/admin/news", async (req, res) => {
  const { adminEmail, title, content } = req.body;
  if (adminEmail !== ADMIN_EMAIL) return res.json({ code: 403, msg: "无管理员权限" });
  if (!title || !content) return res.json({ code: 400, msg: "标题和内容不能为空" });
  const newsList = await db.getData("/newsList");
  newsList.unshift({
    id: Date.now(),
    title,
    content,
    time: new Date().toLocaleString()
  });
  await db.push("/newsList", newsList, true);
  res.json({ code: 200, msg: "新闻发布成功" });
});

app.delete("/api/admin/news/:id", async (req, res) => {
  const { adminEmail } = req.query;
  if (adminEmail !== ADMIN_EMAIL) return res.json({ code: 403, msg: "无管理员权限" });
  const id = parseInt(req.params.id);
  let newsList = await db.getData("/newsList");
  newsList = newsList.filter(item => item.id !== id);
  await db.push("/newsList", newsList, true);
  res.json({ code: 200, msg: "新闻已删除" });
});

// ========== 百宝箱 ==========
app.get("/api/box", async (req, res) => {
  const boxData = await db.getData("/boxData");
  res.json({ code: 200, data: boxData });
});

app.post("/api/admin/box", async (req, res) => {
  const { adminEmail, data } = req.body;
  if (adminEmail !== ADMIN_EMAIL) return res.json({ code: 403, msg: "无管理员权限" });
  await db.push("/boxData", data || [], true);
  res.json({ code: 200, msg: "百宝箱已保存" });
});

// 启动
app.listen(port, () => {
  console.log(`丐帮网站已启动：http://127.0.0.1:${port}`);
});
