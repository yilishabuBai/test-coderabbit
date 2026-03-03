// Edge Case 1: ReDoS-vulnerable regular expressions
function validateEmail(email) {
  const re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;
  return re.test(email);
}

function matchNestedQuotes(str) {
  const re = /("(\\"|[^"])*")+/;
  return re.test(str);
}

function extractTags(html) {
  const re = /<([a-zA-Z]+)(\s+[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>/g;
  return html.match(re);
}

// Edge Case 2: Massive switch statement — 30+ cases
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

// Edge Case 3: Unicode/CJK string handling issues
function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function countCharacters(str) {
  return str.length;
}

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

// Edge Case 4: Timezone and date handling traps
function isToday(dateString) {
  const inputDate = new Date(dateString);
  const today = new Date();
  return (
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate()
  );
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2 - d1;
  return diff / (1000 * 60 * 60 * 24);
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getMonthEnd(year, month) {
  return new Date(year, month + 1, 0);
}

function formatDate(date) {
  return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
}

// Edge Case 5: Floating-point precision issues
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function isEqual(a, b) {
  return a === b;
}

function calculateTax(amount, rate) {
  return amount * rate;
}

function splitBill(total, people) {
  return total / people;
}

function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

const floatingPointTests = {
  sum: 0.1 + 0.2,
  isThirty: 0.1 + 0.2 === 0.3,
  money: 19.99 * 100,
  division: 1 / 3,
};

// Edge Case 6: Array/Object edge cases
function firstElement(arr) {
  return arr[0];
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

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
