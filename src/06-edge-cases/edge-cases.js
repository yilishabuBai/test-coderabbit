/**
 * 验证邮箱字符串是否符合预定义的正则格式。
 * @param {string} email - 要验证的邮箱地址字符串。
 * @returns {boolean} `true` 如果邮箱符合格式，`false` 否则。
 * @example
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid@@example'); // false
 */
function validateEmail(email) {
  const re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;
  return re.test(email);
}

/**
 * 检查字符串中是否包含一个或多个由双引号包裹的子串（子串内部允许使用转义的双引号）。
 * @param {string} str - 要检测的输入字符串。
 * @returns {boolean} `true` 如果输入包含至少一个由双引号包裹的子串（内部允许使用 `\"` 转义），否则 `false`。
 * @example
 * // 返回 true
 * matchNestedQuotes('He said "Hello \\"World\\"" loudly');
 * @example
 * // 返回 false
 * matchNestedQuotes('No quoted substring here');
 */
function matchNestedQuotes(str) {
  const re = /("(\\"|[^"])*")+/;
  return re.test(str);
}

/**
 * 从输入字符串中提取类似 HTML 的起始标签（包含可选属性）。
 *
 * 匹配形如 `<tag>`, `<tag/>`, `<tag attr="value">`, `<tag attr='value' attr2=value>` 等开头标签并返回所有匹配项。
 *
 * @param {string} html - 要搜索的包含 HTML 或类似标签的字符串。
 * @returns {string[]|null} 所有匹配的标签字符串数组；如果没有匹配则返回 `null`（与 String.prototype.match 行为一致）。
 * @example
 * // 返回 ["<div class=\"a\">", "<img src='x'/>"]
 * extractTags('<div class="a">hello<img src=\'x\'/>');
 */
function extractTags(html) {
  const re = /<([a-zA-Z]+)(\s+[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>/g;
  return html.match(re);
}

/**
 * 根据 HTTP 状态码返回对应的人类可读描述。
 * @param {number} code - HTTP 状态码（例如 200、404、500）。
 * @returns {string} 对应的状态短语；如果状态码未在列表中定义，则返回 "Unknown Status Code"。
 * @example
 * // 返回 'Not Found'
 * getHttpStatusMessage(404);
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
 * 将字符串裁剪为指定最大长度并在被截断时追加省略号。
 *
 * @param {string} str - 要裁剪的原始字符串。
 * @param {number} maxLength - 允许的最大字符数；当 str.length 大于此值时会被截断并追加 `'...'`。
 * @returns {string} 裁剪后（必要时带有末尾省略号）的字符串。
 * @example
 * // 返回 "Hello, wo..."
 * truncateString("Hello, world!", 10);
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
 * // 返回 "olleh"
 * reverseString('hello');
 */
function reverseString(str) {
  return str.split('').reverse().join('');
}

/**
 * 获取字符串的字符数。
 * @param {string} str - 要计数的字符串。
 * @returns {number} 字符数（等于 `str.length`）。
 * @example
 * // 返回 5
 * countCharacters('hello');
 */
function countCharacters(str) {
  return str.length;
}

/**
 * 从字符串中提取一个子串，行为与 String.prototype.slice 相同。
 * @param {string} str - 源字符串。
 * @param {number} [start=0] - 起始索引（包含）。支持负值表示从末尾开始计数。
 * @param {number} [end] - 结束索引（不包含）。若省略则一直到字符串末尾；支持负值。
 * @returns {string} 提取出的子串。
 * @example
 * safeSlice('hello', 1, 4); // 'ell'
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
 * 判断给定的日期字符串是否表示本地时区的今天日期。
 *
 * @param {string|number|Date} dateString - 可被 `Date` 构造函数接受的值（例如 ISO 字符串、时间戳或 Date 实例）。
 * @returns {boolean} `true` 如果输入表示与当前本地日期相同的年、月、日，`false` 否则。
 * @example
 * // 假设今天是 2026-03-03（本地时区）
 * isToday('2026-03-03'); // => true
 * isToday('2026-03-02T23:00:00Z'); // 结果取决于本地时区
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
 * 计算两个日期之间相差的天数（结果可为小数，表示部分天数）。
 *
 * 接受能被 Date 构造函数解析的值（Date 对象、时间戳或可解析的日期字符串）。
 *
 * @param {string|Date|number} date1 - 起始日期（被视为较早的日期）。
 * @param {string|Date|number} date2 - 结束日期（被视为较晚的日期）。
 * @returns {number} date2 与 date1 之间的天数差；当 date2 晚于 date1 时为正值，早于时为负值，可能包含小数表示部分天数。
 * @example
 * // 两天之间
 * daysBetween('2023-03-01', '2023-03-03'); // -> 2
 *
 * // 包含部分天数（12 小时差约为 0.5 天）
 * daysBetween('2023-03-01T00:00:00Z', '2023-03-01T12:00:00Z'); // -> 0.5
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2 - d1;
  return diff / (1000 * 60 * 60 * 24);
}

/**
 * 在给定日期字符串上加上指定天数并返回新增日期的 YYYY-MM-DD 格式字符串。
 *
 * @param {string} dateString - 可被 new Date() 解析的日期字符串（例如 "2026-03-01" 或 ISO 格式）；若不可解析将导致异常。
 * @param {number} days - 要添加的天数；可为负数以减去天数。
 * @returns {string} 新日期的 ISO 日期部分（格式为 `YYYY-MM-DD`）。
 * @throws {RangeError} 当 `dateString` 无法解析为有效日期时抛出（会在调用 toISOString 时发生）。
 * @example
 * // 返回 "2026-03-06"
 * addDays('2026-03-01', 5);
 */
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 返回指定年和月的该月最后一日的 Date 对象。
 *
 * @param {number} year - 公历年份（例如 2026）。
 * @param {number} month - 月份，范围为 0（1 月）到 11（12 月）。
 * @returns {Date} 表示该月最后一日的 Date 实例（本地时区，时间为该日的午夜）。
 * @example
 * // 获取 2026 年 2 月的最后一天（注意 month 为 0 起始）
 * const end = getMonthEnd(2026, 1);
 * // end -> Date object for 2026-02-28 (或闰年为 29)
 */
function getMonthEnd(year, month) {
  return new Date(year, month + 1, 0);
}

/**
 * 将 Date 对象格式化为 "M/D/YYYY" 形式的字符串。
 * @param {Date} date - 要格式化的 Date 对象。
 * @returns {string} 格式化后的日期字符串，格式示例："3/9/2026"（月/日/年，月和日不填充前导零）。
 * @example
 * // 输出 "3/9/2026"
 * formatDate(new Date('2026-03-09'));
 */
function formatDate(date) {
  return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
}

/**
 * 计算购物项列表的总价。
 *
 * 逐项将 price 与 quantity 相乘并累加，返回所有项的总和。
 * @param {Array<{price:number,quantity:number}>} items - 包含 price 和 quantity 字段的项数组。
 * @returns {number} 所有项的总价（price * quantity 的累加和）。
 * @example
 * const items = [{ price: 9.99, quantity: 2 }, { price: 5, quantity: 1 }];
 * // returns 24.98
 * calculateTotal(items);
 */
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

/**
 * 检查两个值是否使用严格相等（===）操作符相等。
 * @param {*} a - 要比较的第一个值。
 * @param {*} b - 要比较的第二个值。
 * @returns {boolean} `true` 如果 a 与 b 使用严格相等相等，`false` 否则。
 * @example
 * // 返回 true
 * isEqual(1, 1);
 * // 返回 false
 * isEqual(1, '1');
 */
function isEqual(a, b) {
  return a === b;
}

/**
 * 计算按给定税率应缴纳的税额。
 * @param {number} amount - 应税金额（货币单位）。
 * @param {number} rate - 税率，使用小数表示（例如 0.2 表示 20%）。
 * @returns {number} 计算得到的税额。
 * @example
 * // 计算 100 元的 20% 税额
 * calculateTax(100, 0.2); // 20
 */
function calculateTax(amount, rate) {
  return amount * rate;
}

/**
 * 将总额平均分摊到若干人上并返回每人应付金额。
 *
 * @param {number} total - 待分摊的总金额。
 * @param {number} people - 分摊人数，期望为大于 0 的整数；为 0 时函数将返回 Infinity 或触发运行时错误（视环境而定）。
 * @returns {number} 每人应付的金额（total 除以 people 的结果）。
 * @example
 * // 每人应付 25
 * splitBill(100, 4);
 */
function splitBill(total, people) {
  return total / people;
}

/**
 * 将数字四舍五入到两位小数。
 * @param {number} num - 要四舍五入的数字。
 * @returns {number} 四舍五入到小数点后两位的数字（例如 `1.235` -> `1.24`）。
 * @example
 * // 返回 1.24
 * roundToTwoDecimals(1.235);
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
 *
 * @param {Array} arr - 要检索第一个元素的数组。
 * @returns {*} 第一个元素的值；如果数组为空或不是数组则返回 `undefined`。
 * @example
 * const a = [1, 2, 3];
 * firstElement(a); // 1
 */
function firstElement(arr) {
  return arr[0];
}

/**
 * 判断一个对象是否不含可枚举的自有属性。
 *
 * @param {Object} obj - 要检查的对象（应为非 null/undefined 的对象）。
 * @returns {boolean} `true` 如果对象不含任何可枚举的自有属性，`false` 否则。
 * @throws {TypeError} 当传入 `null` 或 `undefined` 时，会在内部调用 `Object.keys` 抛出 TypeError。
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
 * 按点分隔的路径从对象中逐级访问并返回嵌套属性的值。
 * @param {Object} obj - 要访问的目标对象。
 * @param {string} path - 用点分隔的属性路径，例如 "a.b.c"。
 * @returns {*} 指定路径处的值（可能为任意类型或 `undefined`）。
 * @throws {TypeError} 当遍历过程中遇到 `null` 或 `undefined` 导致无法继续访问属性时抛出。
 * @example
 * const data = { a: { b: { c: 1 } } };
 * safeGet(data, 'a.b.c'); // 1
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
