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
 * 从十进制金额创建一个不可变的 Money 值对象。
 *
 * 金额以整数分（cents）存储以避免浮点精度问题。
 *
 * @param {number} amount - 十进制金额，例如 19.99
 * @param {string} [currency='USD'] - ISO 4217 货币代码
 * @returns {Money} 返回一个冻结的 Money 对象，形如 `{ cents: number, currency: string }`，其中金额以分为单位（整数）
 * @example
 * // 创建 19.99 美元
 * createMoney(19.99, 'USD') // -> { cents: 1999, currency: 'USD' }
 */
function createMoney(amount, currency = DEFAULT_CURRENCY) {
  const cents = Math.round(amount * Math.pow(10, CURRENCY_PRECISION));
  return Object.freeze({ cents, currency });
}

/**
 * 将两个 Money 值相加，并确保货币一致。
 *
 * @param {Money} a - 要相加的第一个 Money 对象，形如 `{ cents: number, currency: string }`。
 * @param {Money} b - 要相加的第二个 Money 对象，形如 `{ cents: number, currency: string }`。
 * @returns {Money} 新的 Money 对象，表示两者的 cents 之和且使用相同的 currency。
 * @throws {Error} 当两个 Money 对象的 currency 不同时抛出错误。
 * @example
 * const one = createMoney(1.00, 'USD'); // { cents: 100, currency: 'USD' }
 * const two = createMoney(2.50, 'USD'); // { cents: 250, currency: 'USD' }
 * addMoney(one, two); // { cents: 350, currency: 'USD' }
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
 * 将 Money 对象格式化为用于显示的货币字符串。
 *
 * @param {Money} money - 包含 `cents`（整数，最小货币单位）和 `currency`（ISO 货币代码）的 Money 值对象。
 * @returns {string} 格式化后的货币字符串，形如 `"USD 10.00"`（货币代码后跟按 CURRENCY_PRECISION 保留的小数金额）。
 * @example
 * const m = createMoney(10, 'USD'); // { cents: 1000, currency: 'USD' }
 * formatMoney(m); // "USD 10.00"
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
 * 根据指定折扣计算并返回新的 Money 值。
 *
 * 使用 discount.type 选择折扣策略计算折扣金额，返回一个不可变的 Money 对象，表示原始金额减去折扣后的结果。
 *
 * @param {{ cents: number, currency: string }} amount - 原始金额对象，使用整数 cents 和货币代码。
 * @param {{ type: string, value: number }} discount - 折扣描述，包含策略类型（例如 "percentage"、"fixed"、"none"）和策略值。
 * @returns {{ cents: number, currency: string }} 扣除折扣后的 Money 对象，cents 为原始 cents 减去计算得到的折扣 cents，currency 与输入相同。
 * @example
 * const price = { cents: 5000, currency: 'USD' };
 * const discount = { type: 'percentage', value: 10 };
 * const discounted = applyDiscount(price, discount);
 * // discounted => { cents: 4500, currency: 'USD' }
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
 * 验证电子邮箱字符串并收集格式错误信息。
 *
 * 检查类型、空值、是否包含 "@", 本地部分长度（不超过 64），以及域名是否包含点。
 *
 * @param {string} email - 要验证的电子邮箱字符串。
 * @returns {{valid: boolean, errors: string[]}} 验证结果：`valid` 为 `true` 表示通过，`errors` 包含不通过的错误消息（若无则为空数组）。
 * @example
 * // returns { valid: true, errors: [] }
 * validateEmail('user@example.com');
 *
 * @example
 * // returns { valid: false, errors: ['Email must be a string'] }
 * validateEmail(123);
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
 * 验证用户注册负载的字段并收集所有校验错误。
 *
 * @param {Object} payload - 注册数据，应包含 `username`, `email`, `password` 字段。
 * @returns {ValidationResult} 验证结果；`valid` 为 `true` 表示通过，`errors` 列出所有失败原因。
 * @example
 * validateRegistration({ username: 'joe', email: 'joe@example.com', password: 'secret123' });
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
 * 在失败时对异步操作进行重试并使用指数退避延迟。
 *
 * @param {Function} fn - 要执行并可能重试的异步函数（应返回或抛出结果/错误）。
 * @param {Object} [options] - 重试配置。
 * @param {number} [options.maxAttempts=3] - 最大尝试次数（至少为 1）。
 * @param {number} [options.baseDelay=1000] - 基础延迟毫秒数，重试间隔按 2 的指数倍增长（baseDelay, baseDelay*2, ...）。
 * @returns {*} 函数 `fn` 成功时的返回值。
 * @throws {Error} 当所有尝试均失败时抛出，错误信息包含尝试次数和最后一次错误的信息。
 * @example
 * // 在最多 5 次尝试、基础延迟 500ms 的配置下重试网络请求
 * const result = await withRetry(() => fetch('/api/data'), { maxAttempts: 5, baseDelay: 500 });
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
 * 在给定的毫秒数内执行传入的异步函数，若超时则抛出超时错误。
 *
 * @param {Function} fn - 不带参数的函数，返回一个 Promise，代表要执行的异步操作。
 * @param {number} timeoutMs - 超时时间，单位为毫秒。
 * @returns {*} fn() 成功解析时的值。
 * @throws {Error} 当超时发生时抛出，错误消息为 `Operation timed out after ${timeoutMs}ms`。
 * @throws {*} 若 fn() 本身拒绝，则会传播并抛出其原始错误。
 * @example
 * // 在 1000ms 内执行异步操作，否则抛出超时错误
 * await withTimeout(() => fetch(url), 1000);
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
 * 按点分隔路径安全地读取对象的嵌套属性。
 *
 * @param {Object|null|undefined} obj - 待读取的对象，允许为 null 或 undefined。
 * @param {string} path - 点分隔的路径（例如 "user.address.city"）。
 * @param {*} [defaultValue] - 当路径不可达或输入为 null/undefined 时返回的默认值。
 * @returns {*} 找到的属性值；如果路径的任一步不存在或为 null/undefined，则返回 defaultValue。
 * @example
 * const data = { user: { address: { city: 'Beijing' } } };
 * safeGet(data, 'user.address.city', 'unknown'); // 'Beijing'
 * safeGet(data, 'user.phone.number', 'unknown'); // 'unknown'
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
 * 创建并返回对象的浅复制并对其冻结以防止后续修改。
 *
 * @param {Object} obj - 要克隆并冻结的源对象。
 * @returns {Object} 被冻结的浅复制对象（浅拷贝，无法添加、修改或删除顶层属性）。
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = immutableClone(original);
 * // cloned !== original
 * // cloned.a === 1
 * // 尝试修改会在严格模式下抛出或静默失败：
 * // cloned.a = 5;
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
