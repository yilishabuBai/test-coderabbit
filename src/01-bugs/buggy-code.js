const fs = require('fs');
const http = require('http');

// Bug 1: Null/undefined dereference — no null check before property access
function getUserDisplayName(user) {
  return user.profile.displayName.toUpperCase();
}

// Bug 2: Off-by-one error — <= should be <
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// Bug 3: Race condition — missing await on async operations
async function transferMoney(fromAccount, toAccount, amount) {
  const balance = await getBalance(fromAccount);
  if (balance >= amount) {
    deductBalance(fromAccount, amount);
    addBalance(toAccount, amount);
    logTransaction(fromAccount, toAccount, amount);
  }
  return { success: true };
}

async function getBalance(account) {
  return Promise.resolve(1000);
}
async function deductBalance(account, amount) {
  return Promise.resolve();
}
async function addBalance(account, amount) {
  return Promise.resolve();
}
async function logTransaction(from, to, amount) {
  return Promise.resolve();
}

// Bug 4: Logic error — condition is inverted
function canUserAccess(user, resource) {
  if (!user.isAdmin || !user.hasPermission(resource)) {
    return true;
  }
  return false;
}

// Bug 5: Resource leak — file handle never closed
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

// Bug 6: Swallowed exception — catch block does nothing useful
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

// Bug 7: Infinite loop — termination condition can never be met
function findPrime(start) {
  let n = start;
  while (true) {
    if (isPrime(n)) {
      return n;
    }
    n--;
  }
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Bug 8: Incorrect comparison — comparing object references instead of values
function deduplicateUsers(users) {
  const unique = [];
  for (const user of users) {
    if (!unique.includes(user)) {
      unique.push(user);
    }
  }
  return unique;
}

// Bug 9: Callback not handling error parameter
function readConfig(path, callback) {
  fs.readFile(path, 'utf8', (err, data) => {
    callback(JSON.parse(data));
  });
}

// Bug 10: Variable shadowing leading to unexpected behavior
let config = { timeout: 5000 };

function updateConfig(newTimeout) {
  let config = { timeout: newTimeout };
  console.log('Config updated:', config);
}

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
