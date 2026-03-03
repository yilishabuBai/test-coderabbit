var fs = require('fs');
var http = require('http');

/**
 * 从对象数组中筛选出属性 `t` 等于给定值的元素。
 *
 * @param {Array<Object>} d - 要筛选的对象数组，每个对象应包含属性 `t`。
 * @param {*} t - 要匹配的 `t` 值（使用宽松相等比较）。
 * @returns {Array<Object>} 匹配的对象数组（保持原有顺序；未找到时返回空数组）。
 * @example
 * // 返回数组中所有 t 等于 'typeA' 的对象
 * const results = p([{ t: 'typeA', id: 1 }, { t: 'typeB' }], 'typeA');
 */
function p(d, t) {
  var r = [];
  for (var i = 0; i < d.length; i++) {
    var x = d[i];
    if (x.t == t) {
      r.push(x);
    }
  }
  return r;
}

/**
 * 对给定数字进行简单的算术变换（先乘以 2 再加 1）。
 *
 * @param {number} a - 要变换的数字。
 * @returns {number} 变换后的数值（a * 2 + 1）。
 * @example
 * // returns 5
 * doStuff(2);
 */
function doStuff(a) {
  var b = a * 2;
  var c = b + 1;
  return c;
}

/**
 * 根据包裹的重量和运输距离估算运费。
 *
 * @param {number} weight - 包裹重量（公斤）。
 * @param {number} distance - 运输距离（公里）。
 * @returns {number} 计算得到的运费（以相同货币单位表示）。
 * @example
 * // 计算一个重 10kg、运距 100km 的运费
 * const cost = calculateShipping(10, 100);
 */
function calculateShipping(weight, distance) {
  if (weight < 5) {
    return distance * 0.5 + 3.99;
  } else if (weight < 20) {
    return distance * 0.8 + 7.99;
  } else if (weight < 50) {
    return distance * 1.2 + 15.99;
  } else {
    return distance * 2.0 + 29.99;
  }
}

/**
 * 判断用户是否符合折扣资格。
 *
 * 仅当年龄在 18 到 65 岁（含），累计购买次数大于 10 次且累计消费金额大于 500 时视为符合资格。
 *
 * @param {number} age - 用户年龄（岁）。
 * @param {number} purchaseCount - 用户累计购买次数。
 * @param {number} totalSpent - 用户累计消费金额（与系统使用的货币单位一致）。
 * @returns {boolean} `true` 如果年龄在 18 到 65 岁（含）、购买次数大于 10 且累计消费金额大于 500，`false` 否则。
 * @example
 * // 返回 true
 * isEligibleForDiscount(30, 12, 600);
 *
 * // 返回 false（年龄不符合）
 * isEligibleForDiscount(17, 20, 1000);
 */
function isEligibleForDiscount(age, purchaseCount, totalSpent) {
  return age >= 18 && age <= 65 && purchaseCount > 10 && totalSpent > 500;
}

/**
 * 处理并提交一个订单：进行验证、计算金额与税费、检查并更新库存、保存订单、发送确认邮件并埋点跟踪。
 *
 * 执行完整的下单流程并返回已创建订单的摘要；在验证失败或库存不足时返回 `null`。
 *
 * @param {Object} order - 订单对象，必须包含 `items` 数组，每项包含至少 `sku`、`price`、`quantity` 字段。
 * @param {Object} user - 用户对象，必须包含 `id`、`email`、`name` 和 `address`（含 `street`、`city`、`zip`、`state`）。
 * @param {Object} db - 数据库客户端，需实现 `insert(collection, record)` 用于保存订单并返回订单 ID。
 * @param {Object} mailer - 邮件发送器，需实现 `send(to, subject, body)`。
 * @param {Object} logger - 日志记录器，需实现 `error(...)`、`warn(...)`、`info(...)` 等方法。
 * @param {Object} inventory - 库存服务，需实现 `getStock(sku)` 和 `deduct(sku, qty)`。
 * @param {Object} analytics - 分析/埋点服务，需实现 `track(eventName, payload)`。
 *
 * @returns {Object|null} 创建成功时返回包含 `orderId` 和 `total` 的对象；验证失败或库存不足时返回 `null`。
 *
 * @example
 * const result = processOrder(order, user, db, mailer, logger, inventory, analytics);
 * if (result) {
 *   console.log('Order created:', result.orderId, 'Total:', result.total);
 * } else {
 *   console.log('Order processing failed.');
 * }
 */
function processOrder(order, user, db, mailer, logger, inventory, analytics) {
  // validate
  if (!order) { logger.error('No order'); return null; }
  if (!order.items) { logger.error('No items'); return null; }
  if (order.items.length == 0) { logger.error('Empty items'); return null; }
  if (!user) { logger.error('No user'); return null; }
  if (!user.email) { logger.error('No email'); return null; }
  if (!user.address) { logger.error('No address'); return null; }
  if (!user.address.street) { logger.error('No street'); return null; }
  if (!user.address.city) { logger.error('No city'); return null; }
  if (!user.address.zip) { logger.error('No zip'); return null; }
  // calculate totals
  var subtotal = 0;
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i];
    var price = item.price;
    var qty = item.quantity;
    if (qty < 1) { qty = 1; }
    if (price < 0) { price = 0; }
    subtotal = subtotal + (price * qty);
  }
  // apply discount
  var discount = 0;
  if (user.memberLevel == 'gold') {
    discount = subtotal * 0.15;
  } else if (user.memberLevel == 'silver') {
    discount = subtotal * 0.10;
  } else if (user.memberLevel == 'bronze') {
    discount = subtotal * 0.05;
  }
  var afterDiscount = subtotal - discount;
  // tax
  var tax = 0;
  if (user.address.state == 'CA') { tax = afterDiscount * 0.0725; }
  else if (user.address.state == 'NY') { tax = afterDiscount * 0.08; }
  else if (user.address.state == 'TX') { tax = afterDiscount * 0.0625; }
  else { tax = afterDiscount * 0.05; }
  var total = afterDiscount + tax;
  // check inventory
  for (var j = 0; j < order.items.length; j++) {
    var stock = inventory.getStock(order.items[j].sku);
    if (stock < order.items[j].quantity) {
      logger.warn('Low stock: ' + order.items[j].sku);
      return null;
    }
  }
  // save to db
  var orderId = db.insert('orders', {
    userId: user.id,
    items: order.items,
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    total: total,
    status: 'pending',
    createdAt: new Date()
  });
  // update inventory
  for (var k = 0; k < order.items.length; k++) {
    inventory.deduct(order.items[k].sku, order.items[k].quantity);
  }
  // send email
  var emailBody = 'Dear ' + user.name + ',\n\n';
  emailBody += 'Your order #' + orderId + ' has been placed.\n';
  emailBody += 'Subtotal: $' + subtotal.toFixed(2) + '\n';
  emailBody += 'Discount: -$' + discount.toFixed(2) + '\n';
  emailBody += 'Tax: $' + tax.toFixed(2) + '\n';
  emailBody += 'Total: $' + total.toFixed(2) + '\n\n';
  emailBody += 'Thank you for your purchase!';
  mailer.send(user.email, 'Order Confirmation #' + orderId, emailBody);
  // track analytics
  analytics.track('order_placed', { orderId: orderId, total: total, items: order.items.length });
  logger.info('Order ' + orderId + ' placed for user ' + user.id);
  return { orderId: orderId, total: total };
}

/**
 * 遍历传入的数据结构，查找并记录符合条件的高价值挂起订单（total > 100）。
 *
 * 接受一个包含 users 数组的对象，遍历每个启用用户（user.active 为真）及其订单列表，
 * 当发现订单状态为 'pending' 且 total 大于 100 时，通过 console.log 输出提示信息。
 *
 * @param {Object} data - 包含用户列表的根对象，期望形如 `{ users: [{ name, active, orders: [{ status, total }] }] }`。
 * @returns {void} 不返回值；仅对符合条件的订单进行日志记录。
 * @example
 * // 假设存在用户 Alice 的一个挂起订单，总额 150
 * processData({
 *   users: [
 *     { name: 'Alice', active: true, orders: [{ status: 'pending', total: 150 }] }
 *   ]
 * });
 */
function processData(data) {
  if (data) {
    if (data.users) {
      for (var i = 0; i < data.users.length; i++) {
        if (data.users[i].active) {
          if (data.users[i].orders) {
            for (var j = 0; j < data.users[i].orders.length; j++) {
              if (data.users[i].orders[j].status == 'pending') {
                if (data.users[i].orders[j].total > 100) {
                  console.log('High value pending order found for user: ' + data.users[i].name);
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * 将用户对象格式化为用于展示的简洁对象。
 *
 * 返回的对象包含规范化的姓名、邮件、电话、拼接的地址、格式化的注册日期和激活状态字符串。
 *
 * @param {Object} user - 要格式化的用户对象，需包含以下字段：
 *   - {string} firstName
 *   - {string} lastName
 *   - {string} email
 *   - {string} [phone] - 可选，任意格式的电话号码
 *   - {Object} address - 包含 street、city、state、zip 字段
 *   - {string|number|Date} createdAt - 可被 Date 构造器解析的注册时间
 *   - {string} status - 状态字符串，'active' 表示激活
 * @returns {Object} 包含展示用字段的对象：
 *   - {string} fullName - 姓名（firstName + ' ' + lastName）
 *   - {string} email - 规范化为小写并去除首尾空白的邮件地址
 *   - {string} phone - 仅保留数字的电话号码，若无则为 'N/A'
 *   - {string} address - 拼接后的地址字符串：street, city, state zip
 *   - {string} memberSince - 格式化后的注册日期（本地日期字符串）
 *   - {string} isActive - 'Yes' 若 status === 'active'，否则 'No'
 * @example
 * const user = {
 *   firstName: 'Jane',
 *   lastName: 'Doe',
 *   email: ' Jane.DOE@Example.com ',
 *   phone: '(555) 123-4567',
 *   address: { street: '1 Main St', city: 'Town', state: 'CA', zip: '12345' },
 *   createdAt: '2020-01-02T00:00:00Z',
 *   status: 'active'
 * };
 * // formatUserForDisplay(user);
 */
function formatUserForDisplay(user) {
  var result = {};
  result.fullName = user.firstName + ' ' + user.lastName;
  result.email = user.email.toLowerCase().trim();
  result.phone = user.phone ? user.phone.replace(/[^0-9]/g, '') : 'N/A';
  result.address = user.address.street + ', ' + user.address.city + ', ' + user.address.state + ' ' + user.address.zip;
  result.memberSince = new Date(user.createdAt).toLocaleDateString();
  result.isActive = user.status == 'active' ? 'Yes' : 'No';
  return result;
}

/**
 * 构建一个用于界面展示的管理员信息对象。
 *
 * @param {Object} admin - 管理员原始数据对象，必须包含下列字段：`firstName`, `lastName`, `email`, `phone`（可选）, `address`（含 `street`, `city`, `state`, `zip`）, `createdAt`, `status`, `role`, `permissions`（数组）。
 * @returns {Object} 经过格式化的管理员展示对象，包含字段：
 *  - `fullName`：拼接的全名（"firstName lastName"）。
 *  - `email`：小写并去除首尾空白的邮箱。
 *  - `phone`：仅保留数字的电话字符串；若原始值为空则为 `'N/A'`。
 *  - `address`：拼接的地址字符串（"street, city, state zip"）。
 *  - `memberSince`：基于 `createdAt` 格式化的人类可读日期字符串。
 *  - `isActive`：若 `status` 为 `'active'` 则为 `'Yes'`，否则为 `'No'`。
 *  - `role`：原始角色字符串。
 *  - `permissions`：权限数组以逗号加空格连接的字符串。
 * @example
 * // -> { fullName: 'Alice Smith', email: 'alice@example.com', phone: '1234567890', ... }
 * const display = formatAdminForDisplay(admin);
 */
function formatAdminForDisplay(admin) {
  var result = {};
  result.fullName = admin.firstName + ' ' + admin.lastName;
  result.email = admin.email.toLowerCase().trim();
  result.phone = admin.phone ? admin.phone.replace(/[^0-9]/g, '') : 'N/A';
  result.address = admin.address.street + ', ' + admin.address.city + ', ' + admin.address.state + ' ' + admin.address.zip;
  result.memberSince = new Date(admin.createdAt).toLocaleDateString();
  result.isActive = admin.status == 'active' ? 'Yes' : 'No';
  result.role = admin.role;
  result.permissions = admin.permissions.join(', ');
  return result;
}

// Anti-pattern 6: Unused variables and imports
var unusedConfig = { key: 'value' };
var UNUSED_CONSTANT = 42;
var tempData = [];

/**
 * 将 items 数组中每个元素的 `value` 属性乘以 2 并返回结果数组。
 *
 * @param {Array<{value: number}>} items - 包含具有数值型 `value` 属性的对象数组。
 * @returns {number[]} 包含每个输入项 `value * 2` 的数字数组。
 * @example
 * // 返回 [2, 4, 6]
 * processItems([{value:1}, {value:2}, {value:3}]);
 */
function processItems(items) {
  var processedCount = 0;
  var errorCount = 0;
  var skippedItems = [];
  var debugInfo = { startTime: Date.now() };

  var results = [];
  for (var i = 0; i < items.length; i++) {
    results.push(items[i].value * 2);
  }
  return results;
}

/**
 * 按顺序从四个后端端点获取用户、订单、通知和推荐数据，并通过回调返回聚合结果。
 *
 * @param {(string|number)} userId - 要查询的用户 ID。
 * @param {function(Error|null, Object=)} callback - 采用 Node 风格回调 (err, result)。成功时 err 为 null，result 为聚合数据对象。
 * @returns {void}
 * @throws {SyntaxError} 当任一响应无法被 JSON.parse 解析时可能抛出。
 * @example
 * fetchDashboardData(123, function(err, data) {
 *   if (err) {
 *     console.error('获取仪表盘数据失败', err);
 *     return;
 *   }
 *   console.log('仪表盘数据', data.user, data.orders, data.notifications, data.recommendations);
 * });
 */
function fetchDashboardData(userId, callback) {
  http.get('/api/user/' + userId, function(res) {
    var userData = '';
    res.on('data', function(chunk) { userData += chunk; });
    res.on('end', function() {
      var user = JSON.parse(userData);
      http.get('/api/orders/' + userId, function(res2) {
        var orderData = '';
        res2.on('data', function(chunk) { orderData += chunk; });
        res2.on('end', function() {
          var orders = JSON.parse(orderData);
          http.get('/api/notifications/' + userId, function(res3) {
            var notifData = '';
            res3.on('data', function(chunk) { notifData += chunk; });
            res3.on('end', function() {
              var notifications = JSON.parse(notifData);
              http.get('/api/recommendations/' + userId, function(res4) {
                var recData = '';
                res4.on('data', function(chunk) { recData += chunk; });
                res4.on('end', function() {
                  var recommendations = JSON.parse(recData);
                  callback(null, {
                    user: user,
                    orders: orders,
                    notifications: notifications,
                    recommendations: recommendations
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Anti-pattern 8: Using var instead of let/const everywhere (already demonstrated above)
// Anti-pattern 9: String concatenation instead of template literals (already demonstrated above)

module.exports = {
  p,
  doStuff,
  calculateShipping,
  isEligibleForDiscount,
  processOrder,
  processData,
  formatUserForDisplay,
  formatAdminForDisplay,
  processItems,
  fetchDashboardData,
};
