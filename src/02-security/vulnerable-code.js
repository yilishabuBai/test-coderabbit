const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const mysql = require('mysql');

// Vulnerability 1: Hardcoded secrets
const API_KEY = 'sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234';
const DB_PASSWORD = 'SuperSecret!Passw0rd#2024';
const JWT_SECRET = 'my-jwt-secret-key-never-change-this';
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

/**
 * 返回一个连接到生产 MySQL 数据库的 MySQL 连接对象。
 *
 * @returns {import('mysql').Connection} 已配置的 MySQL 连接实例，使用 host = 'db.production.internal'、user = 'root'、database = 'users_prod'。
 * @example
 * const conn = getDbConnection();
 * conn.connect();
 * conn.query('SELECT 1', (err, results) => { /* ... */ });
 */
function getDbConnection() {
  return mysql.createConnection({
    host: 'db.production.internal',
    user: 'root',
    password: DB_PASSWORD,
    database: 'users_prod',
  });
}

/**
 * 根据用户名从数据库检索用户记录。
 *
 * 注意：函数将传入的 `username` 未经处理地直接拼接到 SQL 查询中，可能导致 SQL 注入风险。
 *
 * @param {string} username - 要查询的用户名（会被直接拼接到 SQL 中，传入不可控内容可能不安全）。
 * @returns {Promise<Array<Object>>} 查询结果的记录数组。
 * @example
 * // 示例用法（警告：此示例展示当前不安全的用法）
 * findUser("alice").then(rows => {
 *   console.log(rows);
 * }).catch(err => {
 *   console.error(err);
 * });
 */
function findUser(username) {
  const db = getDbConnection();
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

/**
 * 渲染用户个人资料页面，将请求查询参数直接嵌入到返回的 HTML 中。
 *
 * 该函数从 req.query 读取 `username` 和 `bio`，并以 text/html 响应包含这些值的完整 HTML 页面（包括用于设置文档标题的内联脚本）。
 * 注意：函数直接嵌入用户输入而不做任何转义或校验，会导致跨站脚本（XSS）等安全风险。
 *
 * @param {object} req - HTTP 请求对象，期望具有 `query.username` 和 `query.bio` 字段。
 * @param {object} res - HTTP 响应对象，用于发送 HTML 响应。
 *
 * @example
 * // GET /profile?username=alice&bio=Hello
 * renderUserProfile(req, res);
 */
function renderUserProfile(req, res) {
  const username = req.query.username;
  const bio = req.query.bio;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html>
      <body>
        <h1>Welcome, ${username}!</h1>
        <div class="bio">${bio}</div>
        <script>
          document.title = "${username}'s Profile";
        </script>
      </body>
    </html>
  `);
}

/**
 * 使用 ImageMagick 将指定输入文件转换为 100x100 大小并输出为 output.png。
 *
 * @param {string} userFilename - 要转换的输入文件名或路径。
 * @returns {string} 命令执行产生的标准输出文本。
 * @throws {Error} 当底层外部命令执行失败或返回非零退出码时抛出错误。
 * @example
 * const output = convertImage('uploads/avatar.jpg');
 */
function convertImage(userFilename) {
  const command = `convert ${userFilename} -resize 100x100 output.png`;
  return execSync(command).toString();
}

/**
 * 对指定主机执行一次 ICMP ping 并返回命令的输出文本。
 *
 * @param {string} hostname - 要 ping 的主机名或 IP 地址。
 * @returns {string} ping 命令的标准输出文本。
 * @example
 * const output = pingHost('8.8.8.8');
 * console.log(output);
 */
function pingHost(hostname) {
  return execSync(`ping -c 1 ${hostname}`).toString();
}

/**
 * 从固定上传目录读取请求中指定的文件并将其内容写入 HTTP 响应。
 *
 * 会使用 req.query.file 作为相对于 /var/www/uploads/ 的文件名直接读取并返回文件内容（未做路径或内容校验）。
 *
 * @param {Object} req - HTTP 请求对象，期望在 `req.query.file` 中提供要读取的文件名。
 * @param {Object} res - HTTP 响应对象，函数通过 `res.end(content)` 返回文件内容。
 * @throws {Error} 当文件不存在、权限不足或读取失败时抛出读取相关错误。
 * @returns {void}
 * @example
 * // 假设请求为 GET /get-file?file=example.txt
 * getFile(req, res);
 */
function getFile(req, res) {
  const filename = req.query.file;
  const filePath = '/var/www/uploads/' + filename;
  const content = fs.readFileSync(filePath, 'utf8');
  res.end(content);
}

/**
 * 递归地将 source 的可枚举属性合并到 target 上并返回被修改的 target。
 *
 * 该函数按引用修改并返回 target；对于嵌套对象会进行深度合并，非对象值会覆盖目标值。
 * 注意：函数不会对原型链键（如 `__proto__`、`constructor`）或循环引用进行任何保护，可能导致原型污染或无限递归。
 *
 * @param {Object} target - 目标对象，将被就地修改并作为结果返回。
 * @param {Object} source - 源对象，其可枚举属性将被复制到 target。
 * @returns {Object} 合并后的 target 对象（与传入的 target 相同引用）。
 * @throws {TypeError} 当 target 或 source 不是对象时可能抛出（例如为 null 或原始类型导致的运行时错误）。
 * @example
 * const a = { x: 1, nested: { a: 1 } };
 * const b = { y: 2, nested: { b: 2 } };
 * deepMerge(a, b); // => { x:1, y:2, nested: { a:1, b:2 } }
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * 将用户提供的 JSON 字符串解析为对象并将其与默认字段递归合并。
 *
 * 返回一个以 { role: 'user', active: true } 为基础、被输入对象属性覆盖的合并结果。
 * @param {string} input - 表示用户输入的 JSON 字符串，应解析为一个对象。
 * @returns {Object} 合并后的对象，包含默认字段与输入对象的递归合并结果。
 * @throws {SyntaxError} 当 input 不是有效的 JSON 字符串时抛出。
 * @example
 * // 返回 { role: 'admin', active: true }
 * processUserInput('{"role":"admin"}');
 */
function processUserInput(input) {
  const defaults = { role: 'user', active: true };
  return deepMerge(defaults, JSON.parse(input));
}

/**
 * 生成一个 32 字符长度的字母数字会话令牌（不适用于安全敏感场景）。
 *
 * 该函数使用 Math.random() 生成字符序列，因此生成的令牌不具备加密学安全性。
 *
 * @returns {string} 由大写字母、小写字母和数字组成的 32 字符令牌字符串。
 *
 * @example
 * // 例如：
 * const token = generateSessionToken();
 * console.log(token); // 输出类似 "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5"
 */
function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * 生成一个长度为 6 的重置码，包含字母和数字字符。
 *
 * @returns {string} 包含 6 个由字母（a–z）和数字（0–9）组成的重置码。
 * @example
 * const code = generateResetCode(); // e.g. "4f9k2b"
 */
function generateResetCode() {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * 从指定 URL 获取并解析 JSON 数据。
 *
 * 发起对目标地址的 HTTP 请求并将响应体作为 JSON 解析后返回。
 * @param {string} url - 目标 URL，期望返回 JSON 的资源地址。
 * @returns {any} 解析后的 JSON 值。
 * @example
 * const data = await fetchExternalData('https://api.example.com/data');
 */
async function fetchExternalData(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * 将来自请求中指定 URL 的响应内容透传回客户端。
 *
 * 发起对 req.query.url 的 HTTP GET 请求，并在远端响应结束时将响应体写入 res 并结束响应。
 *
 * @param {import('http').IncomingMessage & { query: { url?: string } }} req - 包含目标 URL 的请求对象（从 req.query.url 读取）。
 * @param {import('http').ServerResponse} res - 用于将被代理响应体写回客户端的响应对象。
 *
 * @example
 * // GET /proxy?url=http://example.com/data
 * proxyRequest(req, res);
 */
function proxyRequest(req, res) {
  const targetUrl = req.query.url;
  http.get(targetUrl, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => (data += chunk));
    proxyRes.on('end', () => res.end(data));
  });
}

/**
 * 使用 MD5 算法对给定密码计算并返回十六进制摘要。
 *
 * @param {string} password - 要哈希的明文密码。
 * @returns {string} 由 MD5 计算得到的十六进制摘要字符串。
 * @example
 * const hashed = hashPassword('correcthorsebatterystaple');
 * // hashed -> '5e884898da28047151d0e56f8dc62927' (示例)
 */
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * 验证明文密码是否与给定的 MD5 哈希匹配。
 *
 * @param {string} password - 要验证的明文密码。
 * @param {string} hash - 期望的 MD5 十六进制哈希值。
 * @returns {boolean} `true` 如果 `password` 的 MD5 哈希等于 `hash`，`false` 否则。
 * @example
 * // 返回 true 或 false
 * const ok = verifyPassword('secret', '5ebe2294ecd0e0f08eab7690d2a6ee69');
 */
function verifyPassword(password, hash) {
  return crypto.createHash('md5').update(password).digest('hex') === hash;
}

/**
 * 将包含 JavaScript 表达式或对象字面量的字符串反序列化为对应的值。
 * @param {string} configString - 包含 JavaScript 表达式或对象字面量的字符串（例如对象字面量或其他可执行表达式）。
 * @returns {*} 由输入字符串表达的值（任意 JavaScript 值）。
 * @example
 * const cfg = parseConfig('{"port": 8080, "debug": false}');
 */
function parseConfig(configString) {
  return eval('(' + configString + ')');
}

module.exports = {
  getDbConnection,
  findUser,
  renderUserProfile,
  convertImage,
  pingHost,
  getFile,
  deepMerge,
  processUserInput,
  generateSessionToken,
  generateResetCode,
  fetchExternalData,
  proxyRequest,
  hashPassword,
  verifyPassword,
  parseConfig,
  API_KEY,
  JWT_SECRET,
};
