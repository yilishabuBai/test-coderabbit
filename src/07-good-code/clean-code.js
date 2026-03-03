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
 * Creates an immutable Money value object from a decimal amount.
 *
 * Stores values as integer cents to avoid floating-point precision issues.
 *
 * @param {number} amount - Decimal amount (e.g. 19.99)
 * @param {string} [currency='USD'] - ISO 4217 currency code
 * @returns {Money}
 */
function createMoney(amount, currency = DEFAULT_CURRENCY) {
  const cents = Math.round(amount * Math.pow(10, CURRENCY_PRECISION));
  return Object.freeze({ cents, currency });
}

/**
 * Adds two Money values, ensuring matching currencies.
 *
 * @param {Money} a
 * @param {Money} b
 * @returns {Money}
 * @throws {Error} If currencies don't match
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
 * Formats a Money object for display.
 *
 * @param {Money} money
 * @returns {string}
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
 * Applies a discount using the strategy pattern.
 *
 * @param {Money} amount
 * @param {{ type: string, value: number }} discount
 * @returns {Money}
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
 * Validates an email address.
 *
 * @param {string} email
 * @returns {ValidationResult}
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
 * Validates a user registration payload.
 *
 * @param {Object} payload
 * @returns {ValidationResult}
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
 * Retries an async operation with exponential backoff.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} [options]
 * @param {number} [options.maxAttempts=3]
 * @param {number} [options.baseDelay=1000]
 * @returns {Promise<*>}
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
 * Executes an async function with a timeout.
 *
 * @param {Function} fn
 * @param {number} timeoutMs
 * @returns {Promise<*>}
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
 * Safely accesses a nested property without throwing on null/undefined.
 *
 * @param {Object} obj
 * @param {string} path - Dot-separated path (e.g. "user.address.city")
 * @param {*} [defaultValue]
 * @returns {*}
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
 * Creates a shallow frozen clone to prevent mutation.
 *
 * @param {Object} obj
 * @returns {Object}
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
