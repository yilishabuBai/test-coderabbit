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

function getDbConnection() {
  return mysql.createConnection({
    host: 'db.production.internal',
    user: 'root',
    password: DB_PASSWORD,
    database: 'users_prod',
  });
}

// Vulnerability 2: SQL Injection — string concatenation in query
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

// Vulnerability 3: XSS — unsanitized user input rendered as HTML
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

// Vulnerability 4: Command Injection — unsanitized input passed to exec
function convertImage(userFilename) {
  const command = `convert ${userFilename} -resize 100x100 output.png`;
  return execSync(command).toString();
}

function pingHost(hostname) {
  return execSync(`ping -c 1 ${hostname}`).toString();
}

// Vulnerability 5: Path Traversal — user input used in file path
function getFile(req, res) {
  const filename = req.query.file;
  const filePath = '/var/www/uploads/' + filename;
  const content = fs.readFileSync(filePath, 'utf8');
  res.end(content);
}

// Vulnerability 6: Prototype Pollution — unsafe recursive merge
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

function processUserInput(input) {
  const defaults = { role: 'user', active: true };
  return deepMerge(defaults, JSON.parse(input));
}

// Vulnerability 7: Insecure randomness — Math.random() for security tokens
function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function generateResetCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Vulnerability 8: SSRF — unvalidated URL fetching
async function fetchExternalData(url) {
  const response = await fetch(url);
  return response.json();
}

function proxyRequest(req, res) {
  const targetUrl = req.query.url;
  http.get(targetUrl, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => (data += chunk));
    proxyRes.on('end', () => res.end(data));
  });
}

// Vulnerability 9: Weak cryptography — MD5 for password hashing
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return crypto.createHash('md5').update(password).digest('hex') === hash;
}

// Vulnerability 10: Insecure deserialization — eval on user input
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
