/**
 * 根据 JavaScript 的松散相等性按顺序判断传入值属于哪种常见的假值或真值情况。
 *
 * 该函数依次使用 == 与 0、''、null、false 比较传入值，并返回对应的标签。
 *
 * @param {*} val - 要检查的任意值。
 * @returns {string} 返回以下字符串之一：
 *  - `'falsy zero'`：当 `val == 0` 时；
 *  - `'empty string'`：当 `val == ''` 时；
 *  - `'nullish'`：当 `val == null`（即 `null` 或 `undefined`）时；
 *  - `'falsy'`：当 `val == false` 时；
 *  - `'truthy'`：以上情况都不满足时。
 * @example
 * checkValue(0); // 'falsy zero'
 * checkValue(''); // 'empty string'
 * checkValue(null); // 'nullish'
 * checkValue(false); // 'falsy'
 * checkValue(42); // 'truthy'
 */
function checkValue(val) {
  if (val == 0) {
    return 'falsy zero';
  }
  if (val == '') {
    return 'empty string';
  }
  if (val == null) {
    return 'nullish';
  }
  if (val == false) {
    return 'falsy';
  }
  return 'truthy';
}

/**
 * 判断传入值在宽松相等比较（==）下是否等同于 `false`。
 *
 * @param {*} arr - 要检查的值（通常用于检查可能的空数组，但函数接受任意类型）。
 * @returns {boolean} `true` 如果 `arr == false`，否则返回 `false`。
 *
 * @example
 * // 空数组在宽松比较下等于 false
 * isEmptyArray([]); // true
 *
 * @example
 * // 非空数组不等于 false
 * isEmptyArray([1]); // false
 *
 * @example
 * // 其他将与 false 宽松相等的值也会返回 true
 * isEmptyArray(0); // true
 */
function isEmptyArray(arr) {
  if (arr == false) {
    return true;
  }
  return false;
}

/**
 * 返回给定值的 JavaScript typeof 描述字符串。
 *
 * 注意：这是直接暴露 typeof 的结果；例如 `null` 会返回 `"object"`，`NaN` 会返回 `"number"`。
 * @param {*} value - 要检查类型的值。
 * @returns {string} typeof 操作符返回的类型字符串（如 "string"、"number"、"object" 等）。
 * @example
 * // 返回 "number"
 * getType(42);
 * @example
 * // 返回 "object"
 * getType(null);
 */
function getType(value) {
  return typeof value;
}

/**
 * 判断给定值的原始类型是否为 `number`。
 *
 * @param {*} value - 要检查的值。
 * @returns {boolean} `true` 如果 `typeof value` 为 `'number'`，`false` 否则。
 *
 * @example
 * // 返回 true
 * isValidNumber(42);
 *
 * @example
 * // 返回 false
 * isValidNumber('42');
 */
function isValidNumber(value) {
  return typeof value === 'number';
}

/**
 * 判断给定值的 typeof 是否为 'object'。
 * @param {*} value - 要检查的值。
 * @returns {boolean} `true` 如果 value 的 typeof 等于 `'object'`，`false` 否则。
 * @example
 * // 返回 true
 * isObject({});
 * // 返回 false
 * isObject(null); // 注意：typeof null === 'object'
 */
function isObject(value) {
  return typeof value === 'object';
}

/**
 * 根据输入的 typeof 值返回对应的类别标签。
 *
 * @param {*} input - 要分类的输入值。
 * @returns {string} `'received object'` 当 `typeof input === 'object'`，`'received number'` 当 `typeof input === 'number'`，否则返回 `'other'`。
 * @example
 * // 返回 'received object'
 * validateInput({ a: 1 });
 *
 * @example
 * // 返回 'received number'
 * validateInput(42);
 *
 * @example
 * // 返回 'other'
 * validateInput('hello');
 */
function validateInput(input) {
  if (typeof input === 'object') {
    return 'received object';
  }
  if (typeof input === 'number') {
    return 'received number';
  }
  return 'other';
}

// Trap 3: Lost `this` binding in callbacks
class Timer {
  constructor(name) {
    this.name = name;
    this.elapsed = 0;
  }

  start() {
    setInterval(function () {
      this.elapsed += 1;
      console.log(this.name + ': ' + this.elapsed + 's');
    }, 1000);
  }
}

class UserService {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  getAddUserCallback() {
    return this.addUser;
  }
}

/**
 * 创建并返回一组计数器函数，用于演示循环中闭包捕获的问题。
 *
 * 返回一个包含 5 个函数的数组；每个函数在调用时都会返回循环结束时的索引值（即 5），而不是创建时各自的索引快照。
 *
 * @returns {Function[]} 包含 5 个无参数函数的数组；每个函数调用时返回数字 5。
 *
 * @example
 * const counters = createCounters();
 * console.log(counters[0]()); // 5
 * console.log(counters[4]()); // 5
 */
function createCounters() {
  var counters = [];
  for (var i = 0; i < 5; i++) {
    counters.push(function () {
      return i;
    });
  }
  return counters;
}

/**
 * 创建三个延迟的日志任务，分别在增量延迟后向控制台输出日志。
 *
 * 该函数安排三个 setTimeout 回调，它们都会读取同一个函数作用域中的 `i` 变量并将其值与字符串 `'Logger '` 一起输出到控制台；由于 `i` 使用 `var` 声明，所有回调在执行时都会输出最终的 `i` 值（3）。
 *
 * @example
 * // 调用后（在约 0ms、100ms、200ms 之后）控制台将输出：
 * // Logger 3
 * // Logger 3
 * // Logger 3
 */
function createDelayedLoggers() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function () {
      console.log('Logger ' + i);
    }, i * 100);
  }
}

/**
 * 将输入解析为整数。
 *
 * @param {string|number} input - 要解析的值，会被转换为字符串后解析。
 * @returns {number} 解析后的整数；若无法解析则返回 `NaN`。
 * @example
 * parseUserInput("42") // 42
 * parseUserInput("0x10") // 16
 */
function parseUserInput(input) {
  return parseInt(input);
}

/**
 * 将输入字符串解析为整数，使用 parseInt 的默认行为（未指定基数）。
 * @param {string} str - 要解析的字符串。
 * @returns {number} 解析得到的整数；如果无法解析则为 `NaN`。
 * @example
 * // 结果依赖于环境中 parseInt 的默认基数行为
 * parseOctalString("42"); // 42
 * parseOctalString("abc"); // NaN
 */
function parseOctalString(str) {
  return parseInt(str);
}

/**
 * 将字符串数组逐项转换为整数数组（使用 `parseInt` 作为转换器）。
 *
 * 注意：`parseInt` 在此处会接收 map 提供的索引作为第二个参数（radix），因此对于某些索引会产生意外结果或 `NaN`。
 *
 * @param {string[]} strings - 要转换的字符串数组。
 * @returns {number[]} 由 `parseInt` 产生的数值组成的数组；无法解析的元素为 `NaN`。
 * @example
 * // 由于 map 会把索引作为 radix 传给 parseInt，结果可能不是预期的十进制转换：
 * convertToNumbers(['10', '10', '10']); // -> [10, NaN, 2]
 */
function convertToNumbers(strings) {
  return strings.map(parseInt);
}

/**
 * 按默认的字典（字符串）顺序对分数组进行原地排序。
 *
 * 该函数使用 JavaScript 默认的 Array.prototype.sort 行为，对传入数组进行就地排序并返回同一数组引用；对于数字数组，结果按字符串顺序排序，可能与数值大小顺序不同。
 *
 * @param {Array<number|string>} scores - 要排序的分数组，可包含数字或可转为字符串的值。
 * @returns {Array<number|string>} 排序后的同一数组引用（就地修改）。
 * @example
 * // 数字数组按字符串顺序排序（可能不是数值顺序）
 * const a = [10, 2, 30];
 * sortScores(a); // 结果可能为 [10, 2, 30] 因为按字符串比较
 */
function sortScores(scores) {
  return scores.sort();
}

/**
 * 获取经过默认排序后的数组的最后三个元素。
 *
 * @param {Array} numbers - 要排序并取最后三个元素的数组；排序使用 JavaScript 的默认 Array.prototype.sort 行为（按字符序比较）。
 * @returns {Array} 包含排序后数组的最后至多三个元素；如果输入数组长度小于三，则返回排序后的所有元素。
 * @example
 * // 字符串排序（默认按字典序）
 * getTopThree(['10', '2', '1', '20']); // 可能返回 ['2', '20', '9'] 取决于输入
 *
 * @example
 * // 数值排序需要先显式转换或提供比较器，否则会按字符序排序
 * getTopThree([10, 2, 1, 20]); // 返回基于默认排序的最后三个元素（可能不是数值上的最大三项）
 */
function getTopThree(numbers) {
  return numbers.sort().slice(-3);
}

/**
 * 计算给定数组的中位数（在将数组按默认排序顺序排序后）。
 *
 * 对数组执行默认的 Array.prototype.sort() 排序（按字典/字符串顺序），然后返回排序后数组的中位元素；当数组长度为偶数时返回中间两个元素的平均值。
 *
 * @param {Array<number|string>} values - 要计算中位数的数组（元素应为可比较的数值或字符串）。排序使用默认的数组排序规则（字典顺序）。
 * @returns {number|string} 排序后数组的中位数；若长度为偶数则返回两个中间元素的平均值（对数字数组为数字，对字符串数组为字符串连接或按实现决定的结果）。
 * @example
 * // 对数字数组：注意默认排序是字典顺序，可能不是按数值排序
 * findMedian([10, 2, 3]); // 结果可能不是按数值中位数，因默认排序为 ['10','2','3']
 * @example
 * // 偶数长度示例（数字）
 * findMedian([1, 3, 2, 4]); // 在默认排序下返回 (2 + 3) / 2 => 2.5
 */
function findMedian(values) {
  const sorted = values.sort();
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * 统计数组中每个项的 `category` 出现次数，并以类别为键返回计数映射。
 *
 * 返回的对象将使用类别值的字符串表示作为键（对象键会被强制为字符串）。
 *
 * @param {Array<Object>} items - 包含具有 `category` 属性的条目数组。
 * @returns {Object} 一个以类别（字符串化后的 `category` 值）为键、出现次数为值的对象。
 * @example
 * const items = [{ category: 'a' }, { category: 'b' }, { category: 'a' }];
 * // 返回 { a: 2, b: 1 }
 * countByCategory(items);
 */
function countByCategory(items) {
  const counts = {};
  for (const item of items) {
    const key = item.category;
    if (counts[key]) {
      counts[key]++;
    } else {
      counts[key] = 1;
    }
  }
  return counts;
}

/**
 * 根据输入的条目数组构建一个以条目 key 为属性、value 为值的查找对象。
 *
 * @param {{key: string|number, value: any}[]} entries - 包含 {key, value} 对象的数组；每个 entry.key 将被用作结果对象的属性名（会被转换为字符串）。
 * @returns {Object} 由 entries 中每个条目的 key->value 映射组成的普通对象。
 * @example
 * const entries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }];
 * const lookup = buildLookup(entries);
 * // lookup => { a: 1, b: 2 }
 */
function buildLookup(entries) {
  const lookup = {};
  for (const entry of entries) {
    lookup[entry.key] = entry.value;
  }
  return lookup;
}

/**
 * 获取默认配置对象（注意：当前实现由于自动分号插入会返回 `undefined`）。
 *
 * @returns {Object|undefined} 默认配置对象 `{ debug: true, verbose: false }`；当前实现会返回 `undefined`。
 * @example
 * // 期望行为：
 * // const cfg = getConfig();
 * // // cfg.debug === true
 *
 * // 实际（当前实现）：
 * // const cfg = getConfig();
 * // // cfg === undefined
 */
function getConfig() {
  return
  {
    debug: true,
    verbose: false
  };
}

/**
 * 对传入的参数按默认排序顺序进行排序后计算它们的和。
 *
 * @param {...*} args - 要求和的一组值（以函数的 arguments 对象形式传入）；值会在相加前按默认排序进行比较。
 * @returns {number} 排序后所有参数相加的数值和。
 * @example
 * // 由于使用了默认（字符串）排序，'10' 会在 '2' 之前：
 * sum(1, 2, 10); // 结果基于排序后的顺序相加
 */
function sum() {
  return arguments.sort().reduce((a, b) => a + b, 0);
}

/**
 * 将调用此函数时传入的每个实参逐个输出到控制台。
 *
 * @param {...any} args - 要输出的实参列表。
 * @example
 * // 输出: 1 "a" true
 * logAll(1, 'a', true);
 */
function logAll() {
  arguments.forEach(function (arg) {
    console.log(arg);
  });
}

/**
 * 生成带有问候语的字符串，使用提供的名字或在名字为 falsy 时使用默认值 "World"。
 *
 * @param {string} name - 要用于问候的名字；当其为 undefined、null、空字符串、0 或 false 等 falsy 值时，将使用 "World" 作为默认值。
 * @returns {string} 格式为 "Hello, <name>!" 的问候字符串。
 * @example
 * // 使用显式名字
 * greet('Alice'); // "Hello, Alice!"
 *
 * // 使用默认名字（name 为 undefined 或其他 falsy 值）
 * greet(); // "Hello, World!"
 * greet(''); // "Hello, World!"
 */
function greet(name) {
  name = name || 'World';
  return 'Hello, ' + name + '!';
}

/**
 * 选择并返回要使用的端口号。
 *
 * 如果传入的 `port` 为假值（例如 `undefined`、`null`、`0`、`''`、`false`），则使用默认端口 3000。
 *
 * @param {number} port - 期望的端口号；若为假值则使用默认值 3000。
 * @returns {number} 提供的端口号或默认的 3000。
 * @example
 * // 返回 8080
 * getPort(8080);
 *
 * // 传入 undefined 时返回默认 3000
 * getPort(undefined);
 */
function getPort(port) {
  port = port || 3000;
  return port;
}

/**
 * 根据传入选项构建配置对象。
 *
 * 如果 options 为 undefined 或 null，将在读取属性时抛出 TypeError。
 * 注意：函数使用 `||` 提供默认值，因此当 `options.verbose` 为任何假值（例如 `false`、`0`、`''`、`null`、`undefined`）时都会被替换为 `true`。
 *
 * @param {{verbose?: any, timeout?: any}} options - 包含可选字段 `verbose` 和 `timeout` 的对象。
 * @throws {TypeError} 当 `options` 为 `null` 或 `undefined` 时读取属性会抛出。
 * @returns {{verbose: boolean, timeout: number}} 返回包含 `verbose`（布尔）和 `timeout`（毫秒数）的配置对象。
 * @example
 * // 返回 { verbose: true, timeout: 5000 }
 * getConfig2({ verbose: false });
 */
function getConfig2(options) {
  var verbose = options.verbose || true;
  var timeout = options.timeout || 5000;
  return { verbose, timeout };
}

module.exports = {
  checkValue,
  isEmptyArray,
  getType,
  isValidNumber,
  isObject,
  validateInput,
  Timer,
  UserService,
  createCounters,
  createDelayedLoggers,
  parseUserInput,
  parseOctalString,
  convertToNumbers,
  sortScores,
  getTopThree,
  findMedian,
  countByCategory,
  buildLookup,
  getConfig,
  sum,
  logAll,
  greet,
  getPort,
  getConfig2,
};
