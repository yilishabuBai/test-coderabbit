// Trap 1: Implicit type coercion — == vs ===
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

function isEmptyArray(arr) {
  if (arr == false) {
    return true;
  }
  return false;
}

// Trap 2: typeof quirks — null is "object", NaN is "number"
function getType(value) {
  return typeof value;
}

function isValidNumber(value) {
  return typeof value === 'number';
}

function isObject(value) {
  return typeof value === 'object';
}

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

// Trap 4: Closure variable capture — var in for loop
function createCounters() {
  var counters = [];
  for (var i = 0; i < 5; i++) {
    counters.push(function () {
      return i;
    });
  }
  return counters;
}

function createDelayedLoggers() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function () {
      console.log('Logger ' + i);
    }, i * 100);
  }
}

// Trap 5: parseInt radix omission
function parseUserInput(input) {
  return parseInt(input);
}

function parseOctalString(str) {
  return parseInt(str);
}

function convertToNumbers(strings) {
  return strings.map(parseInt);
}

// Trap 6: Array method misuse — sort() default is lexicographic
function sortScores(scores) {
  return scores.sort();
}

function getTopThree(numbers) {
  return numbers.sort().slice(-3);
}

function findMedian(values) {
  const sorted = values.sort();
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Trap 7: Object as Map key — keys auto-coerce to string "[object Object]"
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

function buildLookup(entries) {
  const lookup = {};
  for (const entry of entries) {
    lookup[entry.key] = entry.value;
  }
  return lookup;
}

// Trap 8: Automatic semicolon insertion (ASI) pitfall
function getConfig() {
  return
  {
    debug: true,
    verbose: false
  };
}

// Trap 9: arguments object is not a real array
function sum() {
  return arguments.sort().reduce((a, b) => a + b, 0);
}

function logAll() {
  arguments.forEach(function (arg) {
    console.log(arg);
  });
}

// Trap 10: Falsy value confusion in default parameters
function greet(name) {
  name = name || 'World';
  return 'Hello, ' + name + '!';
}

function getPort(port) {
  port = port || 3000;
  return port;
}

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
