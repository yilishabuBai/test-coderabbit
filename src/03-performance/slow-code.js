const fs = require('fs');

// Performance Issue 1: O(n²) algorithm — nested loop instead of Set/Map lookup
function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

function findCommonElements(listA, listB) {
  const common = [];
  for (const a of listA) {
    for (const b of listB) {
      if (a === b) {
        common.push(a);
        break;
      }
    }
  }
  return common;
}

// Performance Issue 2: Memory leak — unbounded global cache and event listeners
const globalCache = {};
let requestLog = [];

function cacheResult(key, value) {
  globalCache[key] = { value, timestamp: Date.now() };
}

function logRequest(req) {
  requestLog.push({
    url: req.url,
    method: req.method,
    timestamp: Date.now(),
    headers: { ...req.headers },
    body: req.body,
  });
}

class EventManager {
  constructor() {
    this.emitter = require('events').EventEmitter;
  }

  addHandler(element, event, handler) {
    element.addEventListener(event, handler);
  }
}

// Performance Issue 3: Synchronous blocking I/O in async context
async function processFiles(directory) {
  const files = fs.readdirSync(directory);
  const results = [];

  for (const file of files) {
    const content = fs.readFileSync(`${directory}/${file}`, 'utf8');
    const stats = fs.statSync(`${directory}/${file}`);
    results.push({
      name: file,
      size: stats.size,
      lines: content.split('\n').length,
    });
  }

  return results;
}

async function loadConfig() {
  const raw = fs.readFileSync('./config.json', 'utf8');
  return JSON.parse(raw);
}

// Performance Issue 4: Redundant computation inside loops
function processOrders(orders) {
  const results = [];
  for (const order of orders) {
    const taxRate = calculateTaxRate(order.region);
    const discount = calculateDiscount(order.customerId);
    const exchangeRates = JSON.parse(JSON.stringify(getExchangeRates()));

    const total = order.items.reduce((sum, item) => {
      const rate = exchangeRates[item.currency] || 1;
      return sum + item.price * item.quantity * rate;
    }, 0);

    results.push({
      orderId: order.id,
      subtotal: total,
      tax: total * taxRate,
      discount: total * discount,
      final: total * (1 + taxRate) * (1 - discount),
    });
  }
  return results;
}

function calculateTaxRate(region) {
  return 0.08;
}
function calculateDiscount(customerId) {
  return 0.05;
}
function getExchangeRates() {
  return { USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110.0, CNY: 6.45 };
}

// Performance Issue 5: Deep clone in a loop — JSON.parse(JSON.stringify(...))
function createVariations(template, count) {
  const variations = [];
  for (let i = 0; i < count; i++) {
    const copy = JSON.parse(JSON.stringify(template));
    copy.id = i;
    copy.createdAt = new Date().toISOString();
    variations.push(copy);
  }
  return variations;
}

// Performance Issue 6: String concatenation with += in large loop
function buildCsvReport(data) {
  let csv = 'id,name,email,amount,date\n';
  for (let i = 0; i < data.length; i++) {
    csv += data[i].id + ',';
    csv += data[i].name + ',';
    csv += data[i].email + ',';
    csv += data[i].amount + ',';
    csv += data[i].date + '\n';
  }
  return csv;
}

function generateHtmlTable(rows) {
  let html = '<table>';
  for (const row of rows) {
    html += '<tr>';
    for (const cell of row) {
      html += '<td>' + cell + '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

// Performance Issue 7: N+1 query pattern
async function getUsersWithPosts() {
  const users = await fetchAllUsers();
  const result = [];
  for (const user of users) {
    const posts = await fetchPostsByUserId(user.id);
    const comments = await fetchCommentsByUserId(user.id);
    result.push({ ...user, posts, comments });
  }
  return result;
}

async function fetchAllUsers() {
  return [];
}
async function fetchPostsByUserId(id) {
  return [];
}
async function fetchCommentsByUserId(id) {
  return [];
}

module.exports = {
  findDuplicates,
  findCommonElements,
  cacheResult,
  logRequest,
  EventManager,
  processFiles,
  loadConfig,
  processOrders,
  createVariations,
  buildCsvReport,
  generateHtmlTable,
  getUsersWithPosts,
};
