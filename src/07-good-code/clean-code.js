'use strict';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/**
 * @typedef {Object} Money
 * @property {number} cents
 * @property {string} currency
 */

const CURRENCY_PRECISION = 2;
const DEFAULT_CURRENCY = 'USD';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

/**
 * 根据十进制金额创建一个不可变的 Money 值对象。
 *
 * 返回的 Money 使用整数分（cents）表示金额并包含货币代码，避免浮点精度问题。
 *
 * @param {number} amount - 十进制金额（例如：19.99）。
 * @param {string} [currency='USD'] - ISO 4217 货币代码，默认 `'USD'`。
 * @returns {Money} 返回一个包含 `cents`（整数）和 `currency` 的不可变 Money 对象。
 * @example
 * const m = createMoney(19.99, 'USD');
 * // m -> { cents: 1999, currency: 'USD' }（已被冻结）
 */
function createMoney(amount, currency = DEFAULT_CURRENCY) {
  const cents = Math.round(amount * Math.pow(10, CURRENCY_PRECISION));
  return Object.freeze({ cents, currency });
}

/**
 * 将两个 Money 值相加并返回一个新的不可变 Money，要求两者使用相同货币。
 *
 * @param {Money} a - 第一个金额对象，`cents` 为以分为单位的整数，`currency` 为货币代码。
 * @param {Money} b - 第二个金额对象，`cents` 为以分为单位的整数，`currency` 为货币代码。
 * @returns {Money} 新的 Money 对象，`cents` 为两个输入金额之和（整数分），`currency` 为相同货币代码。
 * @throws {Error} 当两者的 `currency` 不同时抛出错误。
 * @example
 * const a = createMoney(1.50, 'USD'); // { cents: 150, currency: 'USD' }
 * const b = createMoney(2.25, 'USD'); // { cents: 225, currency: 'USD' }
 * const sum = addMoney(a, b); // { cents: 375, currency: 'USD' }
 */
function addMoney(a, b) {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} and ${b.currency}`);
  }
  return Object.freeze({
    cents: a.cents + b.cents,
    currency: a.currency,
  });
}

/**
 * 将 Money 对象格式化为带货币代码和固定小数位的显示字符串。
 *
 * @param {Money} money - 值对象，包含整数 `cents`（以最小货币单位计）和字符串 `currency`（货币代码）。
 * @returns {string} 格式化后的字符串，形式为 "<CURRENCY> <amount>"，其中 amount 为按两位小数显示的十进制金额。
 * @example
 * // returns "USD 10.00" for { cents: 1000, currency: 'USD' }
 * formatMoney({ cents: 1000, currency: 'USD' });
 */
function formatMoney(money) {
  const amount = (money.cents / Math.pow(10, CURRENCY_PRECISION)).toFixed(CURRENCY_PRECISION);
  return `${money.currency} ${amount}`;
}

// --- Strategy Pattern for discount calculation ---

const discountStrategies = Object.freeze({
  percentage(amount, value) {
    return createMoney(amount.cents * (value / 100) / Math.pow(10, CURRENCY_PRECISION));
  },
  fixed(amount, value) {
    const discountCents = Math.min(
      Math.round(value * Math.pow(10, CURRENCY_PRECISION)),
      amount.cents
    );
    return Object.freeze({ cents: discountCents, currency: amount.currency });
  },
  none() {
    return createMoney(0);
  },
});

/**
 * 计算并返回应用折扣后的 Money 值。
 *
 * 根据 discount.type 选择折扣策略计算折扣额，然后返回一个不可变的 Money 对象，表示原始金额减去计算出的折扣（以分为单位，保留原货币）。
 *
 * @param {Money} amount - 要应用折扣的金额对象，形如 `{ cents: number, currency: string }`，其中 `cents` 为整数分。
 * @param {{ type: string, value: number }} discount - 折扣描述对象，`type` 用于选择策略（例如 `"percentage"`、`"fixed"` 或 `"none"`），`value` 为该策略所需的数值参数。
 * @returns {Money} 返回新的不可变 Money 对象，表示扣除折扣后的金额（`cents` 为整数，`currency` 与输入相同）。
 * @example
 * const price = createMoney(10.00, 'USD'); // { cents: 1000, currency: 'USD' }
 * const discounted = applyDiscount(price, { type: 'percentage', value: 10 }); // 10% 折扣 -> { cents: 900, currency: 'USD' }
 */
function applyDiscount(amount, discount) {
  const strategy = discountStrategies[discount.type] ?? discountStrategies.none;
  const discountAmount = strategy(amount, discount.value);
  return Object.freeze({
    cents: amount.cents - discountAmount.cents,
    currency: amount.currency,
  });
}

// --- Input validation with clear error messages ---

/**
 * 验证电子邮件地址的格式并返回验证结果。
 *
 * 检查是否为字符串、去除首尾空白后是否为空、是否包含 '@'、本地部分长度是否超过 64、以及域名是否包含点。
 *
 * @param {string} email - 要验证的电子邮件字符串（会在校验前去除首尾空白）。
 * @returns {ValidationResult} 验证结果对象，形如 `{ valid: boolean, errors: string[] }`；`valid` 为 `true` 表示通过所有校验，`errors` 列出所有失败原因。
 *
 * @example
 * // returns { valid: true, errors: [] }
 * validateEmail('user@example.com');
 *
 * @example
 * // returns { valid: false, errors: ['Email must contain @'] }
 * validateEmail('invalid-email');
 */
function validateEmail(email) {
  const errors = [];

  if (typeof email !== 'string') {
    errors.push('Email must be a string');
    return { valid: false, errors };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    errors.push('Email cannot be empty');
  }
  if (!trimmed.includes('@')) {
    errors.push('Email must contain @');
  }
  const [localPart, domain] = trimmed.split('@');
  if (localPart && localPart.length > 64) {
    errors.push('Local part cannot exceed 64 characters');
  }
  if (domain && !domain.includes('.')) {
    errors.push('Domain must contain at least one dot');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证用户注册所需的请求负载的字段并返回验证结果。
 *
 * 验证以下字段：`username`（至少 3 个字符）、`email`（见 validateEmail 规则）和 `password`（至少 8 个字符）。
 *
 * @param {Object} payload - 要验证的对象，预期包含 `username`, `email`, `password` 字段。
 * @returns {ValidationResult} `valid` 为 `true` 表示所有验证通过；`errors` 为字符串数组，包含所有发现的错误消息。
 * @example
 * const result = validateRegistration({ username: 'alice', email: 'alice@example.com', password: 's3cr3tPa$$' });
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
function validateRegistration(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null object'] };
  }

  const { username, email, password } = payload;

  if (typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  const emailValidation = validateEmail(email);
  errors.push(...emailValidation.errors);

  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return { valid: errors.length === 0, errors };
}

// --- Async utilities with proper error handling ---

/**
 * 使用指数退避策略重试异步操作直到成功或达到最大尝试次数。
 *
 * @param {Function} fn - 要执行的异步函数或返回 Promise 的函数；应在成功时解析为所需值，在失败时抛出或拒绝以触发重试。
 * @param {Object} [options] - 重试配置。
 * @param {number} [options.maxAttempts=3] - 最大尝试次数（包含第一次调用）。
 * @param {number} [options.baseDelay=1000] - 指数退避的基准延迟（毫秒）；每次失败后延迟按 baseDelay * 2^(attempt-1) 增长。
 * @returns {*} 成功时解析为 `fn` 返回的值。
 * @throws {Error} 当所有尝试均失败时抛出，错误消息包含最大尝试次数和最后一次失败的消息。
 * @example
 * // 重试一个可能会短暂失败的异步请求
 * await withRetry(() => fetchWithAuth('/api/data'), { maxAttempts: 5, baseDelay: 500 });
 */
async function withRetry(fn, options = {}) {
  const { maxAttempts = MAX_RETRY_ATTEMPTS, baseDelay = RETRY_BASE_DELAY_MS } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError.message}`);
}

/**
 * 对给定异步操作施加超时限制并在超时后以 Error 拒绝该操作。
 *
 * 当 fn 在指定时间内完成时，返回其解析值；当超时发生时，返回一个描述超时的 Error；若 fn 拒绝，则传播该错误。
 *
 * @param {Function} fn - 返回一个 Promise 的函数（调用时不接受参数）。
 * @param {number} timeoutMs - 超时时间，单位为毫秒。
 * @returns {Promise<*>} fn 完成时的解析值。
 * @throws {Error} 超时时抛出，错误消息格式为 "Operation timed out after ${timeoutMs}ms"。
 * @example
 * // 用法示例
 * withTimeout(() => fetch('/api/data'), 5000)
 *   .then(res => res.json())
 *   .catch(err => console.error(err));
 */
function withTimeout(fn, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// --- Safe object utilities ---

/**
 * 安全地按点路径获取对象的嵌套属性，若路径不存在则返回默认值。
 * @param {Object} obj - 要访问的对象（可为 null 或 undefined）。
 * @param {string} path - 用点分隔的属性路径，例如 "user.address.city"。
 * @param {*} [defaultValue] - 当路径未找到或中途为 null/undefined 时返回的默认值。
 * @returns {*} 指定路径对应的值；若不存在则返回 defaultValue。
 * @example
 * const data = { user: { name: 'Ali' } };
 * safeGet(data, 'user.name', '未知'); // 'Ali'
 * safeGet(data, 'user.age', 0); // 0
 */
function safeGet(obj, path, defaultValue = undefined) {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }

  return current ?? defaultValue;
}

/**
 * 创建并返回一个浅拷贝的不可变对象副本，用于防止对原对象的直接修改。
 *
 * 该副本包含原对象的可枚举自有属性（浅拷贝），并对返回对象调用 Object.freeze 以阻止后续变更。
 *
 * @param {Object} obj - 要克隆的源对象；其可枚举自有属性将被复制到返回值中。
 * @returns {Object} 返回源对象的浅拷贝并已被冻结（不可变）。
 * @throws {TypeError} 当传入的 `obj` 为 `null` 或 `undefined` 时，扩展操作符会抛出 TypeError。
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const clone = immutableClone(original);
 * // clone.a === 1
 * // clone.b === original.b  （浅拷贝，嵌套对象仍为同一引用）
 * // 修改 clone.a 将失败（在严格模式下抛出，在非严格模式 silently fail）
 */
function immutableClone(obj) {
  return Object.freeze({ ...obj });
}

module.exports = {
  createMoney,
  addMoney,
  formatMoney,
  applyDiscount,
  validateEmail,
  validateRegistration,
  withRetry,
  withTimeout,
  safeGet,
  immutableClone,
};
