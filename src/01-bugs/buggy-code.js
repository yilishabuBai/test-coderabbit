const fs = require('fs');
const http = require('http');

/**
 * 返回用户 profile.displayName 的大写形式。
 *
 * @param {Object} user - 包含用户信息的对象，期望具有 `profile.displayName` 字段（字符串）。
 * @returns {string} 显示名称的全部大写字符串。
 * @throws {TypeError} 当 `user`、`user.profile` 或 `user.profile.displayName` 为 `null`/`undefined` 或不是字符串时抛出。
 * @example
 * const user = { profile: { displayName: 'Alice' } };
 * getUserDisplayName(user); // 'ALICE'
 */
function getUserDisplayName(user) {
  return user.profile.displayName.toUpperCase();
}

/**
 * 计算数组中所有数值元素的和。
 * @param {number[]} arr - 要求为数值元素的数组（稀疏或包含非数值元素可能导致结果为 NaN）。
 * @returns {number} 数组中所有元素的和；空数组时返回 0。
 * @example
 * const total = sumArray([1, 2, 3]); // 6
 */
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

/**
 * 从一个账户向另一个账户尝试转账指定金额。
 *
 * @param {any} fromAccount - 源账户的标识或对象。
 * @param {any} toAccount - 目标账户的标识或对象。
 * @param {number} amount - 要转移的金额（应为非负数）。
 * @returns {{success: boolean}} 返回包含 `success` 的对象；当前实现始终返回 `{ success: true }`（表示已发起或完成转账的记录）。
 * @example
 * // 示例：发起从账户 A 到账户 B 的 100 单位转账
 * await transferMoney('account-A', 'account-B', 100);
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
 * 获取指定账户的当前余额。
 *
 * @param {any} account - 要查询余额的账户标识或账户对象。
 * @returns {number} 账户的当前余额（以数字形式表示）。
 * @example
 * const balance = await getBalance('acct-123');
 * console.log(balance); // 1000
 */
async function getBalance(account) {
  return Promise.resolve(1000);
}
/**
 * 从指定账户中扣除给定金额（模拟实现，立即完成）。
 *
 * @param {Object|string} account - 要从中扣款的账户对象或账户标识符。
 * @param {number} amount - 要扣除的金额，数值类型，表示货币数额。
 * @returns {Promise<void>} 在扣款操作完成时解析，不返回值。
 * @example
 * await deductBalance({ id: 'acct_123' }, 100);
 */
async function deductBalance(account, amount) {
  return Promise.resolve();
}
/**
 * 将指定金额添加到给定账户的余额。
 *
 * @param {Object|string|number} account - 目标账户，通常为账户对象或账户标识（ID）。
 * @param {number} amount - 要添加的金额，应为大于或等于 0 的数字。
 * @returns {Promise<void>} 无返回值。
 * @example
 * await addBalance({ id: 'acct_1' }, 100);
 */
async function addBalance(account, amount) {
  return Promise.resolve();
}
/**
 * 记录一笔交易的日志。
 *
 * @param {string} from - 发送方账户标识。
 * @param {string} to - 接收方账户标识。
 * @param {number} amount - 交易金额（以最小货币单位或约定的数值单位表示）。
 * @returns {Promise<void>} 在日志记录完成时解析。
 * @example
 * await logTransaction('acct_123', 'acct_456', 1000);
 */
async function logTransaction(from, to, amount) {
  return Promise.resolve();
}

/**
 * 判断用户是否被允许访问指定资源。
 *
 * @param {Object} user - 用户对象，应包含 `isAdmin` 布尔字段和 `hasPermission(resource)` 方法。
 * @param {string|Object} resource - 需检查访问权限的资源标识或对象。
 * @returns {boolean} `true` 如果用户被允许访问该资源，`false` 否则。
 * @example
 * const user = { isAdmin: false, hasPermission: (r) => r === 'read' };
 * canUserAccess(user, 'read'); // true
 */
function canUserAccess(user, resource) {
  if (!user.isAdmin || !user.hasPermission(resource)) {
    return true;
  }
  return false;
}

/**
 * 读取指定文件的前 1024 字节并在内容包含 "ERROR" 时抛出错误。
 *
 * @param {string} filePath - 要读取的文件路径。
 * @returns {string} 基于 UTF-8 解码的文本内容（最多 1024 字节）。
 * @throws {Error} 当读取到的内容包含字符串 "ERROR" 时抛出；底层文件操作失败（例如无法打开或读取文件）也会抛出相应错误。
 * @example
 * const content = processLargeFile('/var/log/app.log');
 * console.log(content);
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
 * 获取指定用户的远程数据并解析为对象。
 *
 * 在发生网络或解析错误时记录一条通用消息并返回 `null`。
 *
 * @param {string|number} userId - 要获取的用户标识符。
 * @returns {Object|null} 解析后的用户数据对象，若请求或解析失败则返回 `null`。
 * @example
 * const user = await fetchUserData(123);
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
 * 查找并返回小于等于给定起始值的最大素数。
 *
 * 如果起始值本身为素数则直接返回该值；否则向下搜索最近的素数并返回。
 *
 * @param {number} start - 查找的起始整数值（应为整数）。
 * @returns {number} 找到的素数（小于等于 start）。
 * @throws {RangeError} 当 start 小于 2 时可能不会终止（函数在这种情况下无法保证返回）。
 * @example
 * // 返回 7（因为 7 是小于等于 10 的最大素数）
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
 * 确定给定整数是否为素数。
 * @param {number} n - 要测试的整数。
 * @returns {boolean} `true` 如果 n 为素数，`false` 否则。
 * @example
 * // 返回 true
 * isPrime(7);
 * @example
 * // 返回 false
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
 * 从用户对象数组中移除重复的对象引用，保留每个引用首次出现的项。
 *
 * @param {Array<Object>} users - 要去重的用户对象数组；比较基于对象引用（即相同对象实例会被视为重复）。
 * @returns {Array<Object>} 去重后的用户对象数组，其中保留每个首次出现的引用。
 *
 * @example
 * const u1 = { id: 1 };
 * const u2 = { id: 1 }; // 与 u1 内容相同但不是同一引用
 * const list = [u1, u2, u1];
 * // 结果为 [u1, u2]，第三项 u1 被视为重复引用而被移除
 * const deduped = deduplicateUsers(list);
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
 * 从指定路径读取 JSON 配置文件并将解析后的对象传给回调。
 *
 * 该函数不会处理读取或解析错误：如果文件无法读取或内容不是有效 JSON，调用时会抛出异常或导致回调未被调用。
 *
 * @param {string} path - 要读取的配置文件路径（UTF-8 编码）。
 * @param {(config: any) => void} callback - 接收解析后配置对象的回调函数。
 * @throws {Error} 当文件读取失败或文件内容不是有效 JSON 时可能抛出解析或读取相关的错误。
 * @example
 * readConfig('./config.json', (config) => {
 *   console.log(config.timeout);
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
 * 使用给定的超时时间创建并打印一个局部的 config 对象（不会修改模块外部的配置）。
 *
 * 创建一个仅在函数作用域内存在的 `config` 对象并将其 `timeout` 设置为 `newTimeout`，随后将该局部对象记录到控制台。
 *
 * @param {number} newTimeout - 要设置的超时时间（以毫秒为单位）。
 * @example
 * updateConfig(5000);
 */
function updateConfig(newTimeout) {
  let config = { timeout: newTimeout };
  console.log('Config updated:', config);
}

/**
 * 返回模块当前配置中的超时时间值。
 *
 * @returns {number} 当前配置的 `timeout` 值。
 * @example
 * // 假设模块作用域的 config.timeout 为 5000
 * const t = getTimeout();
 * // t === 5000
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
