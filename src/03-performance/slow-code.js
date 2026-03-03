const fs = require('fs');

/**
 * 查找输入数组中出现超过一次的唯一值并以数组返回。
 *
 * @param {Array} arr - 待检查的数组，元素可为任意可比较值。
 * @returns {Array} 包含所有在输入数组中出现超过一次的唯一元素，元素顺序按首次发现顺序。
 * @example
 * // 返回 [2, 3]
 * findDuplicates([1, 2, 2, 3, 3, 4]);
 */
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

/**
 * 返回同时存在于两个数组中的元素，按 listA 的顺序收集。
 *
 * 使用严格相等 (===) 比较元素；每当 listA 中的元素在 listB 中找到匹配时，就将该元素推入结果（保留 listA 中的重复出现）。
 *
 * @param {Array} listA - 要检查的第一个数组；结果按此数组的顺序生成。
 * @param {Array} listB - 要检查的第二个数组，用于匹配 listA 中的元素。
 * @returns {Array} 包含出现在 listB 中的 listA 元素的数组，保留 listA 中的顺序和重复项。
 * @example
 * // returns [2, 3]
 * findCommonElements([1, 2, 2, 3], [2, 3, 4]);
 */
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

/**
 * 将给定的值存入全局内存缓存并记录当前时间戳。
 * @param {string} key - 用作缓存键的标识（将按原样作为对象属性存储，建议使用字符串）。
 * @param {*} value - 要存入缓存的任意值。
 * @example
 * cacheResult('user:123', { id: 123, name: '张三' });
 */
function cacheResult(key, value) {
  globalCache[key] = { value, timestamp: Date.now() };
}

/**
 * 将请求的关键信息追加到全局请求日志中。
 *
 * @param {Object} req - 包含请求信息的对象，需具有 `url`、`method`、`headers` 和 `body` 字段。
 * @example
 * // 假设有一个类似 Express 的请求对象
 * logRequest({
 *   url: '/api/items',
 *   method: 'POST',
 *   headers: { 'content-type': 'application/json' },
 *   body: { name: 'item' }
 * });
 */
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

/**
 * 读取指定目录并返回该目录下每个文件的名称、字节大小和行数。
 *
 * 返回的数组按目录中发现的文件顺序包含每个文件的元数据对象。
 *
 * @param {string} directory - 要读取的目录路径。
 * @returns {Array<{name: string, size: number, lines: number}>} 每个对象包含文件的 `name`、`size`（字节数）和 `lines`（按换行符计的行数）。
 * @throws {Error} 如果目录不存在、不可读或在读取文件时发生 I/O 错误，则会抛出由底层 fs API 产生的错误。
 * @example
 * const files = await processFiles('/var/log/myapp');
 * // files -> [{ name: 'app.log', size: 1024, lines: 50 }, ...]
 */
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

/**
 * 加载并解析位于项目根目录的 `config.json` 配置文件。
 *
 * @returns {Object} 解析后的配置对象。
 * @throws {Error} 当文件无法读取（例如不存在或无权限）或文件内容不是有效 JSON 时抛出。
 * @example
 * (async () => {
 *   const config = await loadConfig();
 *   console.log(config);
 * })();
 */
async function loadConfig() {
  const raw = fs.readFileSync('./config.json', 'utf8');
  return JSON.parse(raw);
}

/**
 * 为每个订单计算小计、税、折扣和最终金额并返回结果列表。
 *
 * 处理每个订单时会根据订单区域获取税率、根据客户 ID 获取折扣率，并使用一份汇率映射来将每个项目按货币换算后求和作为小计，随后计算税额、折扣额和最终应付金额。
 *
 * @param {Array<Object>} orders - 要处理的订单数组。每个订单对象应包含以下字段：
 *   - {string|number} id: 订单标识。
 *   - {string} region: 用于决定税率的区域标识。
 *   - {string|number} customerId: 用于决定折扣率的客户标识。
 *   - {Array<Object>} items: 订单项数组，每项包含：
 *       - {number} price: 单价。
 *       - {number} quantity: 数量。
 *       - {string} [currency]: 货币代码（若缺失则视为 1:1 汇率）。
 * @returns {Array<Object>} 每个订单的计算结果数组，每项对象包含：
 *   - {string|number} orderId: 原订单 id。
 *   - {number} subtotal: 按汇率换算后的项目总和（小计）。
 *   - {number} tax: 计算得到的税额（subtotal * taxRate）。
 *   - {number} discount: 计算得到的折扣额（subtotal * discountRate）。
 *   - {number} final: 最终应付金额，等于 subtotal 加税后再减折扣（subtotal * (1 + taxRate) * (1 - discountRate)）。
 *
 * @example
 * const orders = [{
 *   id: 'A1',
 *   region: 'US',
 *   customerId: 'C123',
 *   items: [{ price: 10, quantity: 2, currency: 'USD' }]
 * }];
 * const results = processOrders(orders);
 */
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

/**
 * 根据地区标识返回适用的税率。
 *
 * @param {string} region - 表示税区的标识符（例如国家、州或省）。函数当前返回与 region 无关的统一税率。
 * @returns {number} 固定税率 0.08（即 8%）。
 * @example
 * // 返回 0.08
 * calculateTaxRate('US');
 */
function calculateTaxRate(region) {
  return 0.08;
}
/**
 * 获取指定客户的折扣率。
 *
 * @param {(string|number)} customerId - 客户标识（此实现不使用该值，始终返回固定折扣）。
 * @returns {number} 5% 折扣，值为 0.05。
 * @example
 * const d = calculateDiscount('cust-123'); // 0.05
 */
function calculateDiscount(customerId) {
  return 0.05;
}
/**
 * 提供一组固定的货币代码到汇率的映射。
 *
 * 返回一个对象，其键为货币代码（如 `USD`、`EUR`），值为相对于基准货币（USD）的汇率数值。
 *
 * @returns {Object.<string, number>} 货币代码到汇率的映射，例如 `{ USD: 1, EUR: 0.85, GBP: 0.73 }`
 *
 * @example
 * const rates = getExchangeRates();
 * // rates.USD === 1
 * // rates.EUR === 0.85
 */
function getExchangeRates() {
  return { USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110.0, CNY: 6.45 };
}

/**
 * 基于模板生成指定数量的深拷贝变体，并为每个变体分配唯一 `id` 和 `createdAt` 时间戳。
 *
 * @param {Object} template - 用于复制的模板对象（将通过 JSON 深拷贝）。
 * @param {number} count - 要生成的变体数量（大于或等于 0 的整数）。
 * @returns {Object[]} 每个元素为模板的深拷贝并附带 `id`（索引）和 `createdAt`（ISO 字符串）。
 *
 * @example
 * const tpl = { name: 'item', meta: { tags: ['a'] } };
 * const vars = createVariations(tpl, 3);
 * // vars -> [
 * //   { name: 'item', meta: { tags: ['a'] }, id: 0, createdAt: '2026-03-...'},
 * //   { name: 'item', meta: { tags: ['a'] }, id: 1, createdAt: '2026-03-...'},
 * //   { name: 'item', meta: { tags: ['a'] }, id: 2, createdAt: '2026-03-...'}
 * // ]
 */
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

/**
 * 将数据数组格式化为 CSV 字符串（包含表头 id,name,email,amount,date）。
 *
 * @param {Array<Object>} data - 要转换为 CSV 的记录数组，每项应包含键 `id`, `name`, `email`, `amount`, `date`。
 * @returns {string} CSV 格式的字符串，首行为表头，后续行为每条记录对应的逗号分隔字段行。
 * @example
 * const rows = [
 *   { id: 1, name: 'Alice', email: 'a@example.com', amount: 10.5, date: '2023-01-01' },
 *   { id: 2, name: 'Bob',   email: 'b@example.com', amount: 20.0, date: '2023-01-02' }
 * ];
 * const csv = buildCsvReport(rows);
 */
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

/**
 * 根据二维数组构建一个 HTML 表格字符串。
 *
 * @param {Array<Array<any>>} rows - 二维数组，外层数组表示表格的行，内层数组表示该行的单元格值（按顺序为每个 <td> 的内容）。
 * @returns {string} 返回表示整个表格的 HTML 字符串（包含外层的 `<table>`、行 `<tr>` 与单元格 `<td>` 标签）。
 * @example
 * const rows = [
 *   ['姓名', '年龄'],
 *   ['张三', 30],
 *   ['李四', 25]
 * ];
 * const html = generateHtmlTable(rows);
 * // html === '<table><tr><td>姓名</td><td>年龄</td></tr><tr><td>张三</td><td>30</td></tr><tr><td>李四</td><td>25</td></tr></table>'
 */
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

/**
 * 检索所有用户并为每个用户附加其帖子与评论。
 *
 * 执行顺序为：获取所有用户，然后针对每个用户分别获取该用户的帖子和评论，最后返回包含原始用户字段及附加 `posts` 和 `comments` 的新对象数组。
 *
 * @returns {Array<Object>} 包含用户对象并带有 `posts` 和 `comments` 字段的数组。
 *
 * @example
 * (async () => {
 *   const usersWithPosts = await getUsersWithPosts();
 *   console.log(usersWithPosts[0].posts, usersWithPosts[0].comments);
 * })();
 */
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

/**
 * 获取所有用户的列表。
 *
 * 当前实现为占位实现，会返回一个空数组。
 *
 * @returns {Array<Object>} 用户对象数组（当前实现为空数组）。
 * @example
 * // 从异步上下文中调用
 * const users = await fetchAllUsers();
 */
async function fetchAllUsers() {
  return [];
}
/**
 * 获取指定用户的帖子列表。
 *
 * 当前实现为存根：始终返回空数组。
 *
 * @param {number|string} id - 用户的唯一标识符。
 * @returns {Array<Object>} 指定用户的帖子对象数组；在本实现中始终为 `[]`。
 * @example
 * // 实际应返回帖子对象数组，但当前为存根：
 * const posts = await fetchPostsByUserId(123);
 * // posts === []
 */
async function fetchPostsByUserId(id) {
  return [];
}
/**
 * 获取指定用户的评论列表。
 *
 * 当前实现为占位实现，始终返回空数组。
 *
 * @param {number|string} id - 要查询的用户标识（数字或字符串形式的用户 ID）。
 * @returns {Array<Object>} 评论对象数组；每个对象代表一条评论，当前实现返回空数组。
 * @example
 * const comments = await fetchCommentsByUserId(42);
 * // comments -> []
 */
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
