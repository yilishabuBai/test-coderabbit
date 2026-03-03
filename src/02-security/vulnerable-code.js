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
 * 创建并返回使用模块内固定配置连接到生产用户数据库的 MySQL 连接对象。
 *
 * 该连接使用模块级别的 `DB_PASSWORD` 常量以及固定的主机、用户和数据库名进行配置。
 *
 * @returns {object} 已配置的 MySQL 连接对象（由 `mysql.createConnection` 返回）。
 * @example
 * const conn = getDbConnection();
 * conn.connect(err => {
 *   if (err) throw err;
 *   // 使用 conn 执行查询...
 * });
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
 * 根据给定的用户名查询用户表中的记录。
 * @param {string} username - 要查询的用户名。
 * @returns {Promise<Object[]>} 查询到的用户记录数组。
 * @example
 * findUser('alice')
 *   .then(users => console.log(users))
 *   .catch(err => console.error(err));
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
 * 将请求查询参数渲染为用户资料的 HTML 响应。
 *
 * 从 req.query 读取 username 和 bio，并以 Content-Type 为 text/html 的响应返回包含这些值的 HTML（未进行任何转义或清理）。
 *
 * @param {import('http').IncomingMessage & { query?: Record<string, string> }} req - HTTP 请求，函数从 req.query.username 和 req.query.bio 读取要渲染的用户输入。
 * @param {import('http').ServerResponse} res - HTTP 响应，函数在其上设置 Content-Type 并发送生成的 HTML。
 *
 * @example
 * // 假设使用简单的 HTTP 服务器，访问 /profile?username=alice&bio=Hello 将返回包含未转义输入的 HTML
 * // GET /profile?username=alice&bio=Hello
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
 * 将指定的图片文件转换并缩放为 100x100 的 PNG 图像并返回命令输出。
 *
 * @param {string} userFilename - 要转换的源图片文件名或路径（由调用者提供）。
 * @returns {string} 命令执行的标准输出内容。
 * @throws {Error} 若外部命令执行失败或返回非零退出码则抛出错误。
 * @example
 * const output = convertImage('uploads/photo.jpg');
 */
function convertImage(userFilename) {
  const command = `convert ${userFilename} -resize 100x100 output.png`;
  return execSync(command).toString();
}

/**
 * 向指定主机发送一次 ICMP 回显请求并返回命令输出。
 *
 * @param {string} hostname - 要 ping 的主机名或 IP 地址（不做任何验证或转义）。
 * @returns {string} 命令执行产生的原始输出字符串。
 * @example
 * const output = pingHost('example.com');
 * console.log(output);
 */
function pingHost(hostname) {
  return execSync(`ping -c 1 ${hostname}`).toString();
}

/**
 * 从 uploads 目录读取由请求查询参数指定的文件并将其内容写入 HTTP 响应。
 *
 * 在 req.query.file 中读取文件名，拼接到目录 /var/www/uploads/ 下并同步读取其内容，再通过 res 结束响应并返回内容。
 *
 * @param {IncomingMessage & { query?: { file?: string } }} req - 包含查询参数 `file` 的请求对象（req.query.file 为目标文件名）。
 * @param {ServerResponse} res - HTTP 响应对象，用于写入并结束响应。
 * @throws {Error} 当读取文件失败（例如文件不存在或权限不足）时抛出文件系统错误。
 * @example
 * // GET /get-file?file=example.txt
 * getFile(req, res);
 */
function getFile(req, res) {
  const filename = req.query.file;
  const filePath = '/var/www/uploads/' + filename;
  const content = fs.readFileSync(filePath, 'utf8');
  res.end(content);
}

/**
 * 递归地将 source 的属性合并到 target 上并返回被修改的 target。
 *
 * 该函数会就地修改并返回 target：对于源对象中为对象的属性，递归合并其子属性；对于非对象属性，直接覆盖目标属性。
 * 注意：函数不对特殊键作任何保护或过滤，像 "__proto__"、"prototype"、"constructor" 等键会被复制，从而可能导致原型污染或安全风险。
 *
 * @param {Object} target - 要被修改并返回的目标对象。
 * @param {Object} source - 源对象，其属性将被合并到 target。
 * @returns {Object} 被修改后的 target 对象（与传入的 target 相同的引用）。
 * @example
 * const a = { x: 1, nested: { a: 1 } };
 * deepMerge(a, { y: 2, nested: { b: 2 } });
 * // a === { x:1, y:2, nested: { a:1, b:2 } }
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
 * 将用户提供的 JSON 字符串解析并与默认设置合并，返回合并后的对象。
 *
 * @param {string} input - 表示用户输入对象的 JSON 字符串（例如 '{"name":"alice"}'）。
 * @returns {Object} 合并后的对象，包含默认字段 `{ role: 'user', active: true }` 与用户提供的字段（用户字段会覆盖默认值）。
 * @throws {SyntaxError} 当 `input` 不是有效的 JSON 时抛出。
 * @example
 * // 返回 { role: 'user', active: true, name: 'alice' }
 * processUserInput('{"name":"alice"}');
 */
function processUserInput(input) {
  const defaults = { role: 'user', active: true };
  return deepMerge(defaults, JSON.parse(input));
}

/**
 * 生成一个由字母和数字组成的 32 字符会话令牌字符串。
 *
 * 注意：该令牌基于 Math.random() 生成，缺乏加密强随机性，不应在安全敏感场景中使用（例如认证或密码重置）。
 *
 * @returns {string} 由 A–Z、a–z、0–9 组成的 32 字符令牌字符串。
 * @example
 * const token = generateSessionToken();
 * console.log(token); // e.g. "aZ3b... (32 chars)"
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
 * 生成一个用于短期用途的六字符字母数字重置码。
 *
 * @returns {string} 生成的六字符重置码（由小写字母和数字组成）。
 * @example
 * // 例如: '4f7k1z'
 * const code = generateResetCode();
 */
function generateResetCode() {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * 从给定 URL 获取并解析 JSON 响应。
 * @param {string} url - 要请求的完整 URL 地址（应为可返回 JSON 的端点）。
 * @returns {any} 解析后的 JSON 值。
 * @example
 * const data = await fetchExternalData('https://api.example.com/data');
 */
async function fetchExternalData(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * 将指定查询参数中的目标 URL 的响应内容代理并回传给客户端。
 *
 * 读取 req.query.url 作为目标地址，向该地址发起 HTTP GET 请求并把响应主体写回到 res 中。
 *
 * @param {import('http').IncomingMessage & { query?: { url?: string } }} req - 包含 query.url 的请求对象；函数会读取 req.query.url 作为要代理的目标 URL。
 * @param {import('http').ServerResponse} res - 用于向原始客户端返回从目标 URL 获取到的响应主体。
 * @throws {Error} 当对目标 URL 发起请求或接收响应时发生网络或传输错误时，相关错误可能在底层被触发（该函数内部不对错误进行捕获）。
 * @example
 * // 假设在 Express 风格的路由中使用：
 * // GET /proxy?url=http://example.com/data
 * app.get('/proxy', (req, res) => {
 *   proxyRequest(req, res);
 * });
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
 * 计算并返回给定密码的 MD5 哈希值。
 *
 * @param {string} password - 要哈希的原始密码字符串。
 * @returns {string} 输入密码的 MD5 十六进制哈希值。
 * @example
 * const hashed = hashPassword('myP@ssw0rd');
 * // hashed -> '5f4dcc3b5aa765d61d8327deb882cf99'（示例）
 */
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * 验证明文密码是否与给定的 MD5 哈希值相符。
 *
 * @param {string} password - 明文密码。
 * @param {string} hash - 目标 MD5 哈希（十六进制字符串）。
 * @returns {boolean} `true` 如果密码与给定的 MD5 哈希匹配，`false` 否则。
 * @example
 * // 返回 true（如果 hash 是 'password123' 的 MD5）
 * verifyPassword('password123', '482c811da5d5b4bc6d497ffa98491e38');
 */
function verifyPassword(password, hash) {
  return crypto.createHash('md5').update(password).digest('hex') === hash;
}

/**
 * 将表示配置的 JavaScript 字符串求值并返回结果对象。
 *
 * 直接将传入的字符串作为 JavaScript 表达式使用 `eval` 求值并返回其结果。
 *
 * @param {string} configString - 表示配置的 JavaScript 表达式或对象字面量字符串（例如 '{"key": "value"}'）。
 * @returns {*} 求值后的结果（通常为对象），与字符串中表达的值类型相同。
 * @throws {SyntaxError|ReferenceError|Error} 当字符串不是有效的 JavaScript 表达式或在求值过程中发生错误时抛出相应异常。
 * @example
 * const cfg = parseConfig('({ port: 8080, debug: true })');
 * // cfg => { port: 8080, debug: true }
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
