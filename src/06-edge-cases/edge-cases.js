/**
 * 验证字符串是否为有效的电子邮件格式。
 * @param {string} email - 要验证的电子邮件地址字符串。
 * @returns {boolean} `true` 如果输入符合电子邮件格式，`false` 否则。
 * @example
 * // returns true
 * validateEmail('user@example.com');
 * @example
 * // returns false
 * validateEmail('not-an-email');
 */
function validateEmail(email) {
  const re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;
  return re.test(email);
}

/**
 * 检测字符串中是否存在一个或多个连续的用双引号包裹的段落（支持被转义的双引号）。
 *
 * @param {string} str - 要检测的输入字符串。
 * @returns {boolean} `true` 如果字符串包含一个或多个连续的双引号包裹段落且允许内部使用转义引号，否则 `false`。
 * @example
 * // 返回 true
 * matchNestedQuotes('"hello"');
 * // 返回 true（包含转义引号）
 * matchNestedQuotes('"he said \\"hi\\""');
 * // 返回 false
 * matchNestedQuotes('no quotes here');
 */
function matchNestedQuotes(str) {
  const re = /("(\\"|[^"])*")+/;
  return re.test(str);
}

/**
 * 从输入字符串中提取形如 `<tag ...>` 的标签片段。
 *
 * 使用简单的正则匹配开始标签或自闭合标签，包含可选属性及属性值（支持单引号、双引号或无引号）。
 *
 * @param {string} html - 要搜索的 HTML 或类 HTML 字符串。
 * @returns {string[]|null} 匹配到的标签字符串数组；如果没有匹配项则返回 `null`。
 * @example
 * const html = '<div class="a">x</div><img src="x.png"/>';
 * // returns ['<div class="a">', '<img src="x.png"/>']
 * extractTags(html);
 */
function extractTags(html) {
  const re = /<([a-zA-Z]+)(\s+[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>/g;
  return html.match(re);
}

/**
 * 根据 HTTP 状态码返回对应的标准状态短语。
 *
 * @param {number} code - HTTP 状态码（例如 200、404）。
 * @returns {string} 对应的状态短语，如 `'OK'`、`'Not Found'`，若未知则返回 `'Unknown Status Code'`。
 * @example
 * // returns 'OK'
 * getHttpStatusMessage(200);
 *
 * @example
 * // returns 'Unknown Status Code'
 * getHttpStatusMessage(999);
 */
function getHttpStatusMessage(code) {
  switch (code) {
    case 100: return 'Continue';
    case 101: return 'Switching Protocols';
    case 102: return 'Processing';
    case 200: return 'OK';
    case 201: return 'Created';
    case 202: return 'Accepted';
    case 203: return 'Non-Authoritative Information';
    case 204: return 'No Content';
    case 205: return 'Reset Content';
    case 206: return 'Partial Content';
    case 207: return 'Multi-Status';
    case 300: return 'Multiple Choices';
    case 301: return 'Moved Permanently';
    case 302: return 'Found';
    case 303: return 'See Other';
    case 304: return 'Not Modified';
    case 305: return 'Use Proxy';
    case 307: return 'Temporary Redirect';
    case 308: return 'Permanent Redirect';
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 402: return 'Payment Required';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 405: return 'Method Not Allowed';
    case 406: return 'Not Acceptable';
    case 407: return 'Proxy Authentication Required';
    case 408: return 'Request Timeout';
    case 409: return 'Conflict';
    case 410: return 'Gone';
    case 411: return 'Length Required';
    case 412: return 'Precondition Failed';
    case 413: return 'Payload Too Large';
    case 414: return 'URI Too Long';
    case 415: return 'Unsupported Media Type';
    case 416: return 'Range Not Satisfiable';
    case 417: return 'Expectation Failed';
    case 418: return "I'm a Teapot";
    case 422: return 'Unprocessable Entity';
    case 429: return 'Too Many Requests';
    case 500: return 'Internal Server Error';
    case 501: return 'Not Implemented';
    case 502: return 'Bad Gateway';
    case 503: return 'Service Unavailable';
    case 504: return 'Gateway Timeout';
    default: return 'Unknown Status Code';
  }
}

/**
 * 将字符串截断为指定长度并在超出时追加省略号。
 *
 * @param {string} str - 要截断的字符串。
 * @param {number} maxLength - 允许的最大字符数；当字符串长度超过此值时会被截断。
 * @returns {string} 截断后的字符串；如果原字符串长度超过 `maxLength`，结果在末尾追加 `'...'`，否则返回原字符串。
 * @example
 * // 返回 "Hello W..."
 * truncateString("Hello World", 8);
 */
function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

/**
 * 将字符串的字符顺序反转。
 * @param {string} str - 要被反转的字符串。
 * @returns {string} 反转后的字符串。
 * @example
 * // returns 'olleh'
 * reverseString('hello');
 */
function reverseString(str) {
  return str.split('').reverse().join('');
}

/**
 * 确定字符串的字符数，以 UTF-16 代码单元为单位。
 * @param {string} str - 要计数的字符串；注意对补码对（surrogate pairs）和组合字符，此函数按 UTF-16 代码单元计数。
 * @returns {number} `str` 的长度（UTF-16 代码单元数量）。
 * @example
 * // 普通字符
 * countCharacters('abc'); // 3
 * // 包含表情（单个表情通常计为 2 个代码单元）
 * countCharacters('😊'); // 2
 */
function countCharacters(str) {
  return str.length;
}

/**
 * 从字符串中返回指定范围的子串。
 *
 * @param {string} str - 要切取的原始字符串。
 * @param {number} [start=0] - 起始索引（包含）。负值从字符串末尾计算。
 * @param {number} [end] - 结束索引（不包含）。省略则切到字符串末尾；负值从末尾计算。
 * @returns {string} 指定范围内的子串。
 * @example
 * // 返回 "ell"
 * safeSlice("hello", 1, 4);
 */
function safeSlice(str, start, end) {
  return str.slice(start, end);
}

const testStrings = {
  emoji: '👨‍👩‍👧‍👦 Family emoji',
  chinese: '你好世界🌍',
  combined: 'café résumé naïve',
  surrogate: '𝕳𝖊𝖑𝖑𝖔',
  mixed: 'Hello世界🌍café',
};

/**
 * 判断给定日期字符串是否表示本地时区的今天（同年、同月、同日）。
 *
 * 该函数将使用 Date 构造器解析传入的字符串并基于解析结果的本地年、月、日与当前本地日期进行比较。
 *
 * @param {string} dateString - 可被 `Date` 构造器解析的日期字符串（例如 "2026-03-03"、"2026-03-03T12:00:00Z" 等）。
 * @returns {boolean} `true` 如果解析后的日期在本地时区与当前日期的年、月、日完全相同，`false` 否则。
 * @example
 * // 如果今天是 2026-03-03（本地时区）
 * isToday('2026-03-03'); // true
 * isToday('2026-03-02T23:00:00Z'); // 取决于本地时区，可能为 true 或 false
 */
function isToday(dateString) {
  const inputDate = new Date(dateString);
  const today = new Date();
  return (
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate()
  );
}

/**
 * 计算两个可被 Date 构造器解析的日期之间的天数差（以 date1 为基准，结果为 date2 - date1）。
 *
 * @param {string|Date|number} date1 - 第一个日期，支持 Date 实例、时间戳或可被 Date.parse 解析的字符串（例如 "2026-03-01"、ISO 8601 字符串）。
 * @param {string|Date|number} date2 - 第二个日期，支持与 date1 相同的格式。
 * @returns {number} date2 与 date1 之间的差值，单位为天；可为小数以表示部分天数。若 date2 在 date1 之后返回正值，反之返回负值；输入无法解析时返回 NaN。
 *
 * @example
 * // 返回 1
 * daysBetween('2026-03-01', '2026-03-02');
 *
 * @example
 * // 返回 -30
 * daysBetween('2026-04-01', '2026-03-02');
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2 - d1;
  return diff / (1000 * 60 * 60 * 24);
}

/**
 * 将指定日期字符串加上若干天并以 YYYY-MM-DD 格式返回结果日期。
 *
 * @param {string} dateString - 可被 Date 构造器解析的日期字符串（例如 "2023-03-01"）。
 * @param {number} days - 要添加的天数（可为负数以表示减天）。
 * @returns {string} 计算得到的日期，格式为 `YYYY-MM-DD`。
 * @throws {RangeError} 当传入的 `dateString` 无法解析为有效日期时会抛出（`Invalid time value`）。
 * @example
 * // 返回 "2023-03-05"
 * addDays("2023-03-01", 4);
 */
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 获取指定年月对应月份的最后一天的 Date 对象。
 *
 * @param {number} year - 四位年份（例如 2026）。
 * @param {number} month - 月份索引，范围 0（1 月）到 11（12 月）。
 * @returns {Date} 表示该月最后一天的 Date 对象（本地时区，时间为午夜）。
 * @example
 * // 获取 2026 年 2 月（month = 1）的最后一天
 * const lastDay = getMonthEnd(2026, 1);
 * // lastDay -> Date 对象，表示 2026-02-28T00:00:00（本地时区）
 */
function getMonthEnd(year, month) {
  return new Date(year, month + 1, 0);
}

/**
 * 将 Date 对象格式化为 M/D/YYYY 形式的字符串。
 * @param {Date} date - 要格式化的 Date 实例。
 * @returns {string} 按 "M/D/YYYY" 格式表示的日期字符串（月份和日期不补零）。
 * @example
 * const d = new Date(2026, 0, 5); // 2026-01-05
 * formatDate(d); // "1/5/2026"
 */
function formatDate(date) {
  return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
}

/**
 * 计算商品列表中每项价格乘以数量后的总和。
 * @param {Array<{price: number, quantity: number}>} items - 包含条目对象的数组，每个对象应包含数值型 `price`（单价）和 `quantity`（数量）。
 * @returns {number} 所有条目 price * quantity 之和（数值总额）。
 * @example
 * const items = [{ price: 9.99, quantity: 2 }, { price: 5.5, quantity: 3 }];
 * const total = calculateTotal(items); // 36.48
 */
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

/**
 * 判断两个值是否全等（使用严格相等运算符）。
 *
 * @param {*} a - 要比较的第一个值。
 * @param {*} b - 要比较的第二个值。
 * @returns {boolean} `true` 如果 `a` 严格等于 `b`，`false` 否则。
 * @example
 * // 返回 true
 * isEqual(1, 1);
 * @example
 * // 返回 false（类型不同）
 * isEqual(1, '1');
 */
function isEqual(a, b) {
  return a === b;
}

/**
 * 计算按指定税率应付的税额。
 *
 * @param {number} amount - 应税金额（货币单位）。
 * @param {number} rate - 税率，以小数表示（例如 0.2 表示 20%）。
 * @returns {number} 计算得到的税额（amount × rate）。
 * @example
 * // 计算 100 元，税率 20% 的税额
 * calculateTax(100, 0.2); // 20
 */
function calculateTax(amount, rate) {
  return amount * rate;
}

/**
 * 计算每人应分摊的金额。
 *
 * @param {number} total - 总金额（货币单位）。
 * @param {number} people - 人数（分摊份数）。
 * @returns {number} 每人应付的金额。
 * @example
 * // 每人分摊 100 元给 4 个人
 * const share = splitBill(100, 4); // 25
 */
function splitBill(total, people) {
  return total / people;
}

/**
 * 将数字四舍五入到小数点后两位。
 * @param {number} num - 要舍入的数字。
 * @returns {number} 舍入到小数点后两位的数值（例如 1.235 -> 1.24，1.234 -> 1.23）。
 * @example
 * // returns 1.24
 * roundToTwoDecimals(1.235);
 * @example
 * // returns -2.5
 * roundToTwoDecimals(-2.499);
 */
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

const floatingPointTests = {
  sum: 0.1 + 0.2,
  isThirty: 0.1 + 0.2 === 0.3,
  money: 19.99 * 100,
  division: 1 / 3,
};

/**
 * 获取数组的第一个元素。
 * @param {Array} arr - 要读取首项的数组。
 * @returns {*} 第一个元素；如果数组为空则返回 `undefined`。
 * @example
 * const a = [1, 2, 3];
 * console.log(firstElement(a)); // 1
 */
function firstElement(arr) {
  return arr[0];
}

/**
 * 判断一个对象是否不含自身的可枚举属性。
 *
 * @param {Object} obj - 要检查的对象（仅检查自身的可枚举属性，不遍历原型链）。
 * @returns {boolean} `true` 如果对象没有自身的可枚举属性，`false` 否则。
 * @example
 * // 返回 true
 * isEmpty({});
 *
 * // 返回 false
 * isEmpty({ a: 1 });
 */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * 沿点分隔的路径从对象中检索嵌套属性值。
 *
 * @param {Object} obj - 要检索的源对象。
 * @param {string} path - 点分隔的属性路径（例如 "a.b.c"）。
 * @returns {*} 指定路径处的值（如果属性存在则返回该值，可能为 `undefined`）。
 * @throws {TypeError} 当遍历过程中遇到 `undefined` 或 `null` 导致无法继续属性访问时抛出。
 * @example
 * const data = { a: { b: { c: 1 } } };
 * safeGet(data, 'a.b.c'); // => 1
 */
function safeGet(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    current = current[key];
  }
  return current;
}

module.exports = {
  validateEmail,
  matchNestedQuotes,
  extractTags,
  getHttpStatusMessage,
  truncateString,
  reverseString,
  countCharacters,
  safeSlice,
  testStrings,
  isToday,
  daysBetween,
  addDays,
  getMonthEnd,
  formatDate,
  calculateTotal,
  isEqual,
  calculateTax,
  splitBill,
  roundToTwoDecimals,
  floatingPointTests,
  firstElement,
  isEmpty,
  safeGet,
};
