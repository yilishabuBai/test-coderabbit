/**
 * 基于 JavaScript 的宽松相等（==）将输入分类为特定的值类别。
 *
 * @param {*} val - 要分类的任意值。
 * @returns {string} 返回分类字符串：`'falsy zero'`、`'empty string'`、`'nullish'`、`'falsy'` 之一；若不属于上述情况则返回 `'truthy'`。
 * @example
 * checkValue(0)         // 'falsy zero'
 * checkValue('')        // 'empty string'
 * checkValue(null)      // 'nullish'
 * checkValue(false)     // 'falsy'
 * checkValue(42)        // 'truthy'
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
 * 判断传入值在抽象相等比较（==）下是否等于 `false`。
 *
 * 该函数使用宽松相等（`==`）进行比较，因而会把某些在通常语义下看作“空”的值判为 `true`（例如 `null`、`undefined`、`false`、`0`、空字符串 `''` 以及空数组 `[]` 等）。
 *
 * @param {*} arr - 要检测的值。
 * @returns {boolean} `true` 如果 `arr == false`，否则 `false`。
 * @example
 * isEmptyArray([]); // true
 * isEmptyArray([1]); // false
 * isEmptyArray(null); // true
 */
function isEmptyArray(arr) {
  if (arr == false) {
    return true;
  }
  return false;
}

/**
 * 获取给定值的 JavaScript 原始类型字符串表示。
 * @param {*} value - 要检查类型的值。
 * @returns {string} 使用 typeof 运算符得到的类型名称（例如 'object'、'number'、'string' 等）。注意：历史特性会导致 `typeof null` 返回 `'object'`。
 * @example
 * // 'number'
 * getType(42);
 * // 'object'（历史行为）
 * getType(null);
 */
function getType(value) {
  return typeof value;
}

/**
 * 确定传入值的 JavaScript 原始类型是否为 `number`。
 * @param {*} value - 要检查的任意值。
 * @returns {boolean} `true` 如果 `value` 的 `typeof` 为 `'number'`，`false` 否则。
 * @example
 * // 返回 true
 * isValidNumber(42);
 * // 返回 false
 * isValidNumber('42');
 */
function isValidNumber(value) {
  return typeof value === 'number';
}

/**
 * 检查给定值按 `typeof` 运算符是否为 'object'。
 *
 * 注意：`null` 的 `typeof` 值为 'object'，因此该函数对 `null` 返回 `true`；数组和普通对象也返回 `true`。
 * @param {*} value - 要检测的任意值。
 * @returns {boolean} `true` 当 `typeof value === 'object'`，`false` 否则。
 * @example
 * isObject({}) // true
 * @example
 * isObject(null) // true
 * @example
 * isObject([]) // true
 */
function isObject(value) {
  return typeof value === 'object';
}

/**
 * 根据 JavaScript typeof 对传入值进行分类，标识为对象、数字或其他。
 *
 * @param {*} input - 要分类的任意值。
 * @returns {string} 当 input 的 typeof 为 'object' 时返回 'received object'，为 'number' 时返回 'received number'，否则返回 'other'。
 *
 * @example
 * validateInput({}); // 'received object'
 * validateInput(42); // 'received number'
 * validateInput('hi'); // 'other'
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
 * 创建并返回一组函数，这些函数在调用时返回循环结束时的索引值。
 *
 * 每个数组元素都是一个无参函数；由于闭包捕获的是同一变量，调用任意函数都会得到循环结束时的索引（在本实现中为 5）。
 *
 * @returns {Function[]} 包含 5 个函数的数组；调用任意函数会返回数字 5（循环结束时的索引值）。
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
 * 调度三个延迟执行的日志任务，它们在执行时都会打印相同的索引值。
 *
 * 该函数不返回值；在未来的时间点通过 console.log 输出三条消息。
 *
 * @example
 * createDelayedLoggers();
 * // 约在短时间后输出（示例）:
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
 * 将输入字符串解析为整数。
 *
 * 注意：函数使用不带显式基数的 `parseInt`，在某些环境或字符串格式下可能产生八进制或其他基数的歧义。
 *
 * @param {string|number} input - 要解析的输入，通常为字符串；若传入非字符串则会先被转换为字符串再解析。
 * @returns {number} 解析得到的整数；如果无法解析则返回 `NaN`。
 * @example
 * // 朴素用法
 * parseUserInput("42"); // 42
 *
 * // 无显式基数时可能产生意外结果（取决于运行环境/字符串格式）
 * parseUserInput("012"); // 可能返回 10、12 或 8（不同环境行为不同）
 */
function parseUserInput(input) {
  return parseInt(input);
}

/**
 * 将字符串解析为整数，使用 JavaScript 的默认解析规则（注意：未显式指定基数，某些环境或旧规范中前导 `0` 可能被视为八进制）。
 *
 * @param {string} str - 要解析的字符串。
 * @returns {number} 解析得到的整数值；不能解析时返回 `NaN`。
 * @example
 * // 解析十进制数字字符串
 * parseOctalString('42'); // => 42
 * @example
 * // 无法解析时返回 NaN
 * parseOctalString('abc'); // => NaN
 */
function parseOctalString(str) {
  return parseInt(str);
}

/**
 * 将字符串数组转换为整数数组，使用 `parseInt` 对每个元素进行解析。
 *
 * 注意：此实现直接将 `parseInt` 作为 `map` 的回调函数，`map` 会向回调传入 `(value, index)`，
 * 因此 `index` 会被作为 `parseInt` 的 `radix` 参数传入，可能影响解析结果。
 *
 * @param {string[]} strings - 要转换的字符串数组。
 * @returns {number[]} 解析后的数字数组；对于无法解析的元素返回 `NaN`。
 * @example
 * // 可能得到意外结果，因为 index 会被用作 radix
 * convertToNumbers(['10', '10', '10']); // 依环境返回 [2, 10, NaN]（示例）
 */
function convertToNumbers(strings) {
  return strings.map(parseInt);
}

/**
 * 对传入数组进行原地排序并返回排序后的数组，使用默认的 lexicographic 比较规则。
 *
 * 注意：默认比较会先将元素转换为字符串再按字典序比较，这会导致数字排序结果不按数值大小排列。
 *
 * @param {Array} scores - 要排序的数组（会被原地修改）。
 * @returns {Array} 排序后的同一数组。
 * @example
 * // 对数字数组使用默认排序会产生字典序结果，而非数值升序
 * sortScores([10, 2, 1]); // => [1, 10, 2]
 */
function sortScores(scores) {
  return scores.sort();
}

/**
 * 获取数组中排序后的最后三个元素（即排序后最大的三个项）。
 *
 * 对传入数组使用默认的 Array.prototype.sort() 排序（按字符串顺序比较），然后返回最后最多三个元素。
 *
 * @param {Array<any>} numbers - 要排序的数组；元素将按默认 JS 字符串比较进行排序，可能导致数值按字典序排序。
 * @returns {Array<any>} 排序后最后最多三个元素；若输入数组长度小于三，则返回所有元素。
 * @example
 * // 对数值数组，默认排序为字典序，可能得到意外结果：
 * getTopThree([10, 2, 30, 4]); // 可能返回 [10, 2, 30]（取决于排序实现的行为）
 */
function getTopThree(numbers) {
  return numbers.sort().slice(-3);
}

/**
 * 计算并返回给定数值数组的中位数。
 *
 * 该函数会对传入数组进行就地排序并根据长度返回中位数；当元素个数为奇数时返回中间元素，为偶数时返回中间两个元素的算术平均值。
 *
 * @param {number[]} values - 要计算中位数的数值数组（将被就地排序）。
 * @returns {number} 中位数；对于偶数长度返回两个中间值的平均数。
 * @example
 * // 奇数长度
 * findMedian([3, 1, 2]); // => 2
 *
 * // 偶数长度
 * findMedian([4, 1, 2, 3]); // => 2.5
 */
function findMedian(values) {
  const sorted = values.sort();
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * 根据 items 中每个元素的 `category` 属性统计各类别出现的次数。
 * @param {Array<Object>} items - 要统计的项数组；每个项应包含可作为键的 `category` 属性（会被自动转换为字符串）。
 * @returns {Object} 一个以类别字符串为键、出现次数为值的对象（例如 `{ "fruit": 3, "veg": 2 }`）。
 * @example
 * const items = [{category: 'a'}, {category: 'b'}, {category: 'a'}];
 * // returns { a: 2, b: 1 }
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
 * 根据条目数组构建一个由 key 映射到 value 的查找对象。
 *
 * @param {Array<{key: string, value: any}>} entries - 包含 { key, value } 对象的数组；相同的 key 会被后面的条目覆盖。
 * @returns {Object} 由每个 entry.key 映射到对应 entry.value 的普通对象。
 *
 * @example
 * const entries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }];
 * const lookup = buildLookup(entries);
 * // lookup -> { a: 1, b: 2 }
 */
function buildLookup(entries) {
  const lookup = {};
  for (const entry of entries) {
    lookup[entry.key] = entry.value;
  }
  return lookup;
}

/**
 * 提供一个包含 debug 和 verbose 默认设置的配置对象示例。
 *
 * 注意：原函数源代码在 return 与对象字面量之间换行，会触发 JavaScript 的自动分号插入（ASI），导致函数实际返回 `undefined` 而非配置对象。
 * @returns {{debug: boolean, verbose: boolean}|undefined} 配置对象；在原有换行写法下会是 `undefined`。
 * @example
 * // 原始（有 ASI 问题）——实际返回 undefined
 * getConfig();
 *
 * // 正确写法：将对象字面量与 return 同一行以确保返回对象
 * function getConfig() {
 *   return {
 *     debug: true,
 *     verbose: false
 *   };
 * }
 * getConfig(); // => { debug: true, verbose: false }
 */
function getConfig() {
  return
  {
    debug: true,
    verbose: false
  };
}

/**
 * 将所有传入的参数（期望为数字）相加并返回总和。
 *
 * 注意：实现依赖于对 `arguments` 使用 `sort`，在标准环境下 `arguments` 并不拥有 `sort` 方法，
 * 因此此实现会抛出运行时错误。
 *
 * @param {...number} nums - 要相加的数字参数列表。
 * @returns {number} 相加后的数值总和。
 * @throws {TypeError} 当 `arguments.sort` 不存在或不可调用时抛出。
 * @example
 * // 期望：6
 * sum(1, 2, 3);
 */
function sum() {
  return arguments.sort().reduce((a, b) => a + b, 0);
}

/**
 * 将调用时提供的所有参数逐个输出到控制台。
 *
 * 该函数按顺序读取其 arguments 对象，并对每个参数调用 console.log。
 *
 * @example
 * // 在控制台依次输出：1, "a", { x: 1 }
 * logAll(1, 'a', { x: 1 });
 */
function logAll() {
  arguments.forEach(function (arg) {
    console.log(arg);
  });
}

/**
 * 生成一个问候语；当传入的 `name` 为假值时使用 `"World"` 作为默认名称。
 * @param {string} name - 要问候的名字；若为 `null`、`undefined`、空字符串、0、false 或其他假值，则使用 `"World"`。
 * @returns {string} 形式为 `'Hello, <name>!'` 的问候字符串。
 * @example
 * greet('Alice'); // 'Hello, Alice!'
 * greet();        // 'Hello, World!'
 */
function greet(name) {
  name = name || 'World';
  return 'Hello, ' + name + '!';
}

/**
 * 返回传入的端口号；当未提供或传入假值时使用默认端口 3000。
 * @param {number} port - 期望的端口号；若为 `undefined`、`null` 或其他假值（例如 `0`、`''`、`false`）则视为未提供。
 * @returns {number} 解析后的端口号：若 `port` 是真值则返回该值，否则返回 `3000`。
 * @example
 * // 返回 8080
 * getPort(8080);
 * @example
 * // 传入假值时返回默认端口 3000
 * getPort(undefined); // 3000
 */
function getPort(port) {
  port = port || 3000;
  return port;
}

/**
 * 根据传入配置返回包含 verbose 和 timeout 的配置对象。
 *
 * @param {Object} options - 配置对象，期望包含可选属性 `verbose` 和 `timeout`。
 * @param {boolean} [options.verbose] - 是否启用详细模式；当此值为假值时函数会将其设为 `true`。
 * @param {number} [options.timeout] - 超时毫秒数，默认 5000。
 * @returns {{verbose: boolean, timeout: number}} 配置对象，包含解析后的 `verbose` 与 `timeout` 值。
 * @throws {TypeError} 当 `options` 为 `null` 或非对象时抛出。
 * @example
 * // 返回 { verbose: true, timeout: 5000 }
 * getConfig2({});
 *
 * // 返回 { verbose: true, timeout: 3000 }
 * getConfig2({ verbose: false, timeout: 3000 });
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
