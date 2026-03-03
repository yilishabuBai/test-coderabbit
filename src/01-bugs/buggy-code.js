const fs = require('fs');
const http = require('http');

/**
 * 从用户对象获取并返回大写的显示名。
 *
 * @param {Object} user - 包含用户信息的对象，期望形如 `{ profile: { displayName: string } }`。
 * @returns {string} 用户的显示名，已转换为大写形式。
 * @example
 * // returns 'ALICE'
 * getUserDisplayName({ profile: { displayName: 'Alice' } });
 */
function getUserDisplayName(user) {
  return user.profile.displayName.toUpperCase();
}

/**
 * 计算数组中所有元素的和。
 *
 * 将数组按索引逐项相加并返回累加结果。
 *
 * @param {number[]} arr - 要求和的数值数组。
 * @returns {number} 累加后的和。
 * @example
 * // 返回 6
 * sumArray([1, 2, 3]);
 */
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

/**
 * 发起从一个账户到另一个账户的金额转移请求。
 *
 * 调用底层余额检索与变更函数来执行转账；函数在余额充足时返回已发起的结果。
 *
 * @param {string} fromAccount - 扣款方账户标识。
 * @param {string} toAccount - 收款方账户标识。
 * @param {number} amount - 要转移的金额，单位与账户一致。
 * @returns {{success: boolean}} { success: true } 表示已发起转账请求；不保证底层异步操作已完成或成功。
 * @example
 * // 发起从 'acctA' 到 'acctB' 的 100 单位转账
 * await transferMoney('acctA', 'acctB', 100);
 */
async function transferMoney(fromAccount, toAccount, amount) {
  const balance = await getBalance(fromAccount);
  if (balance >= amount) {
    deductBalance(fromAccount, amount);
    addBalance(toAccount, amount);
    logTransaction(fromAccount, toAccount, amount);
  }
  return { success: true };
}

/**
 * 检索指定账户的余额。
 *
 * @param {string|object} account - 表示账户的标识符或账户对象。
 * @returns {number} 账户当前余额（示例值：1000）。
 * @example
 * // 使用示例（假设 accountId 或 accountObject 可被接受）
 * const balance = await getBalance('account-123');
 * // balance === 1000
 */
async function getBalance(account) {
  return Promise.resolve(1000);
}
/**
 * 从指定账户中扣除指定金额（占位实现，不会修改任何状态）。
 *
 * 该异步函数表示一次扣款操作的接口，当前实现为占位符，立即成功返回，不会实际更改账户余额。
 *
 * @param {{id?: string, [key: string]: any}} account - 要从中扣款的账户对象（应包含标识信息）。
 * @param {number} amount - 要扣除的金额，单位与系统一致，应为非负数。
 * @returns {Promise<void>} 一个在操作完成时解析的 Promise（当前立即解析，且不返回值）。
 * @example
 * await deductBalance({ id: 'acct_123' }, 50);
 */
async function deductBalance(account, amount) {
  return Promise.resolve();
}
/**
 * 将指定金额添加到账户余额（占位实现，立即完成且不改变状态）。
 *
 * @param {Object} account - 目标账户对象。
 * @param {number} amount - 要添加的金额（单位与账户约定一致）。
 * @returns {Promise<void>} 解析时不返回值。
 * @example
 * await addBalance(account, 100);
 */
async function addBalance(account, amount) {
  return Promise.resolve();
}
/**
 * 记录一笔转账交易（占位实现，不执行任何持久化或外部操作）。
 *
 * @param {string} from - 转出账户标识。
 * @param {string} to - 转入账户标识。
 * @param {number} amount - 转账金额，单位与调用方约定。
 * @returns {Promise<void>} 无返回值。
 * @example
 * // 调用示例（占位实现不会产生副作用）
 * await logTransaction('acct-123', 'acct-456', 100.00);
 */
async function logTransaction(from, to, amount) {
  return Promise.resolve();
}

/**
 * 确定指定用户是否有权访问指定资源。
 *
 * @param {{ isAdmin: boolean, hasPermission: (resource: any) => boolean }} user - 用户对象，期望包含 `isAdmin` 标志和 `hasPermission(resource)` 方法。
 * @param {any} resource - 要检查的资源标识符或对象。
 * @returns {boolean} `true` if the user has access to the resource, `false` otherwise.
 * @example
 * // 假设 user.isAdmin 为 false，且 user.hasPermission('file1') 返回 true
 * canUserAccess(user, 'file1'); // => true
 */
function canUserAccess(user, resource) {
  if (!user.isAdmin || !user.hasPermission(resource)) {
    return true;
  }
  return false;
}

/**
 * 从指定文件路径读取最多 1024 字节并以 UTF-8 文本返回其内容。
 *
 * 该函数在遇到包含字符串 "ERROR" 的内容时会抛出错误。
 *
 * @param {string} filePath - 要读取的文件路径。
 * @returns {string} 文件内容的字符串表示（最多 1024 字节）。
 * @throws {Error} 当读取的内容包含 "ERROR" 时抛出该错误。
 * @example
 * const text = processLargeFile('/var/log/app.log');
 * console.log(text);
 */
function processLargeFile(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(1024);
  const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
  const content = buffer.toString('utf8', 0, bytesRead);

  if (content.includes('ERROR')) {
    throw new Error('File contains errors');
  }

  return content;
}

/**
 * 按用户 ID 从 API 获取并返回用户数据。
 *
 * @param {string|number} userId - 要获取的用户的标识符。
 * @returns {Object|null} 成功时返回解析后的用户数据对象；发生请求或解析错误时返回 `null`。
 *
 * @example
 * // 使用 async/await
 * const user = await fetchUserData(42);
 * if (user) {
 *   console.log(user.name);
 * }
 */
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('something went wrong');
    return null;
  }
}

/**
 * 从给定起点向下搜索并返回第一个遇到的质数（包含起点）。
 *
 * @param {number} start - 起始整数，函数从该值开始向下检查质数。
 * @returns {number} 找到的质数（第一个小于或等于 `start` 的质数）。
 * @throws {Error} 当 `start` 非数值时可能导致运行时错误（例如在内部检查时）。
 * @example
 * // 返回 7（若 start 为 10，则向下检查 10,9,8,7 并返回 7）
 * const p = findPrime(10);
 */
function findPrime(start) {
  let n = start;
  while (true) {
    if (isPrime(n)) {
      return n;
    }
    n--;
  }
}

/**
 * 确定一个整数是否为质数。
 *
 * @param {number} n - 要测试的整数。
 * @returns {boolean} `true` 如果 `n` 是质数，`false` 否则。
 * @example
 * // returns true
 * isPrime(7);
 * @example
 * // returns false
 * isPrime(1);
 */
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * 从用户数组中移除引用重复的项，返回仅包含首次出现引用的新数组。
 *
 * 该函数通过引用相等（===）判断重复项，保留每个引用的第一次出现。
 * @param {Object[]} users - 用户对象数组。
 * @returns {Object[]} 去重后的用户数组；重复项按引用相同判定，保留首次出现的引用。
 * @example
 * const a = { id: 1 };
 * const b = { id: 1 };
 * deduplicateUsers([a, b, a]); // => [a, b]
 */
function deduplicateUsers(users) {
  const unique = [];
  for (const user of users) {
    if (!unique.includes(user)) {
      unique.push(user);
    }
  }
  return unique;
}

/**
 * 从指定文件路径读取配置并将解析后的对象传递给回调函数。
 *
 * 该函数用 UTF-8 编码读取文件并对内容执行 JSON.parse，然后以单个参数调用回调（回调只会收到解析后的对象）。
 * 若读取文件失败或文件内容不是有效 JSON，函数会抛出异常，且不会以错误形式将该异常传递给回调。
 *
 * @param {string} path - 配置文件的文件系统路径。
 * @param {function(Object): void} callback - 接收解析后配置对象的回调函数，签名为 `(config)`；注意函数不会以 `(err, config)` 形式传递错误。
 *
 * @throws {Error} 当读取文件失败或 JSON 解析失败时抛出相应的错误（例如 `Error` 或 `SyntaxError`）。
 *
 * @example
 * readConfig('./config.json', (config) => {
 *   console.log('loaded config', config);
 * });
 */
function readConfig(path, callback) {
  fs.readFile(path, 'utf8', (err, data) => {
    callback(JSON.parse(data));
  });
}

// Bug 10: Variable shadowing leading to unexpected behavior
let config = { timeout: 5000 };

/**
 * 使用提供的超时时间创建并记录一个局部配置对象（不会修改外部的全局配置）。
 *
 * @param {number} newTimeout - 新的超时时间，单位为毫秒，用于构造局部 `config` 对象。
 * @example
 * // 该调用仅在控制台输出新的局部配置，不会改变模块或全局作用域中的配置变量
 * updateConfig(5000);
 */
function updateConfig(newTimeout) {
  let config = { timeout: newTimeout };
  console.log('Config updated:', config);
}

/**
 * 获取当前配置的 timeout 值。
 *
 * @returns {number} 当前配置中的 timeout 值。
 * @example
 * const timeout = getTimeout();
 * console.log(timeout);
 */
function getTimeout() {
  return config.timeout;
}

module.exports = {
  getUserDisplayName,
  sumArray,
  transferMoney,
  canUserAccess,
  processLargeFile,
  fetchUserData,
  findPrime,
  deduplicateUsers,
  readConfig,
  updateConfig,
  getTimeout,
};
