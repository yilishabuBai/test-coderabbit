var fs = require('fs');
var http = require('http');

/**
 * 根据元素的 `t` 属性筛选数组并返回匹配项。
 *
 * @param {Array<Object>} d - 要筛选的对象数组，每个对象应包含 `t` 属性。
 * @param {*} t - 用于比较的值，会与每个对象的 `t` 属性进行相等比较（使用 ==）。
 * @returns {Array<Object>} 匹配 `t` 值的对象数组，保持原始顺序。
 * @example
 * // 返回所有具有 type 为 'a' 的元素
 * const items = [{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }];
 * const result = p(items, 'a'); // [{ t: 'a', v: 1 }, { t: 'a', v: 3 }]
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
 * 将输入数值乘以 2 后加 1 并返回结果。
 *
 * @param {number} a - 输入数值。
 * @returns {number} 计算后的数值（a * 2 + 1）。
 * @example
 * // 返回 5
 * doStuff(2);
 */
function doStuff(a) {
  var b = a * 2;
  var c = b + 1;
  return c;
}

/**
 * 根据重量分段和运输距离计算运费。
 *
 * 分段规则（基于重量 kg）：
 * - weight < 5:  distance * 0.5 + 3.99
 * - 5 ≤ weight < 20: distance * 0.8 + 7.99
 * - 20 ≤ weight < 50: distance * 1.2 + 15.99
 * - weight ≥ 50: distance * 2.0 + 29.99
 *
 * @param {number} weight - 货物重量，单位为千克（kg）。
 * @param {number} distance - 运输距离，单位为公里（km）。
 * @returns {number} 计算得到的运费金额（与代码环境使用的货币单位一致）。
 * @example
 * // 计算重量 10kg、距离 100km 的运费
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
 * 符合条件必须同时满足以下三项：年龄在 18 到 65 岁（含）之间、购买次数大于 10 次、累计消费金额大于 500。
 * @param {number} age - 用户年龄（整数或浮点数均可）。
 * @param {number} purchaseCount - 用户的历史购买次数。
 * @param {number} totalSpent - 用户累计消费金额。
 * @returns {boolean} `true` 如果用户同时满足年龄、购买次数和累计消费金额的条件，`false` 否则。
 * @example
 * // 返回 true
 * isEligibleForDiscount(30, 12, 600);
 *
 * @example
 * // 返回 false（购买次数不足）
 * isEligibleForDiscount(30, 5, 1000);
 */
function isEligibleForDiscount(age, purchaseCount, totalSpent) {
  return age >= 18 && age <= 65 && purchaseCount > 10 && totalSpent > 500;
}

/**
 * 处理并持久化用户订单：校验输入、计算小计/折扣/税费、校库存、保存订单、扣减库存、发送确认邮件并记录分析事件。
 *
 * @param {Object} order - 订单对象，必须包含 items 数组，每个项包含 `sku`, `price`, `quantity`。
 * @param {Object} user - 用户对象，必须包含 `id`, `name`, `email`, `address`（含 `street`, `city`, `zip`, `state`）和可选的 `memberLevel`。
 * @param {Object} db - 数据库客户端，需实现 `insert(table, record)` 并返回新记录 ID。
 * @param {Object} mailer - 邮件客户端，需实现 `send(to, subject, body)`。
 * @param {Object} logger - 日志器，需实现 `error(msg)`, `warn(msg)`, `info(msg)`。
 * @param {Object} inventory - 库存服务，需实现 `getStock(sku)` 和 `deduct(sku, qty)`。
 * @param {Object} analytics - 分析服务，需实现 `track(eventName, payload)`。
 * @returns {Object|null} 成功时返回包含 `orderId` 和 `total` 的对象；在验证失败或库存不足时返回 `null`。
 *
 * @example
 * // 示例调用
 * const result = processOrder(order, user, db, mailer, logger, inventory, analytics);
 * if (result) {
 *   console.log('已下单，ID：', result.orderId);
 * } else {
 *   console.log('下单失败');
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
 * 遍历传入数据，查找并在控制台记录总额大于 100 且处于 pending 状态的用户订单。
 *
 * 接受一个可能包含 users 数组的对象；对于每个处于 active 状态的用户，遍历其 orders 数组并在发现高额未处理订单时输出一条日志消息。
 *
 * @param {Object} data - 包含用户列表的数据对象。
 * @param {Array<Object>} [data.users] - 用户数组，每个用户对象可能包含 `active`、`name` 和 `orders` 字段。
 * @param {boolean} [data.users[].active] - 用户是否处于激活状态。
 * @param {string} [data.users[].name] - 用户显示名，用于日志输出。
 * @param {Array<Object>} [data.users[].orders] - 该用户的订单数组。
 * @param {string} [data.users[].orders[].status] - 订单状态（例如 `'pending'`）。
 * @param {number} [data.users[].orders[].total] - 订单总额。
 *
 * @example
 * // 在控制台打印出所有符合条件的高额未处理订单的用户名称
 * processData({
 *   users: [
 *     { name: 'Alice', active: true, orders: [{ status: 'pending', total: 150 }] },
 *     { name: 'Bob', active: false, orders: [{ status: 'pending', total: 200 }] }
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
 * 将原始用户对象格式化为用于展示的扁平表示。
 *
 * 接受包含姓名、联系方式、地址和创建时间等字段的用户对象，返回一个包含拼接全名、规范化邮箱、仅数字电话号码、拼接地址、格式化入会日期和活动状态文本的展示对象。
 *
 * @param {Object} user - 原始用户对象，期望至少包含以下字段：`firstName`, `lastName`, `email`, 可选的 `phone`, `address`（包含 `street`, `city`, `state`, `zip`）, `createdAt`, `status`。
 * @returns {Object} 包含展示用字段的对象，包含：
 *   - `fullName`：拼接的姓名（"First Last"）。
 *   - `email`：小写并修剪后的邮箱。
 *   - `phone`：仅保留数字的电话号码字符串，若无则为 `'N/A'`。
 *   - `address`：拼接的街道、城市、州和邮编字符串。
 *   - `memberSince`：从 `createdAt` 格式化得到的本地日期字符串。
 *   - `isActive`：若 `status` 等于 `'active'` 则为 `'Yes'`，否则为 `'No'`。
 *
 * @example
 * // 输入
 * // {
 * //   firstName: 'Jane',
 * //   lastName: 'Doe',
 * //   email: '  JANE.DOE@EXAMPLE.COM ',
 * //   phone: '(555) 123-4567',
 * //   address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '90210' },
 * //   createdAt: '2020-01-15T12:00:00Z',
 * //   status: 'active'
 * // }
 * // 输出示例
 * // {
 * //   fullName: 'Jane Doe',
 * //   email: 'jane.doe@example.com',
 * //   phone: '5551234567',
 * //   address: '123 Main St, Anytown, CA 90210',
 * //   memberSince: '1/15/2020',
 * //   isActive: 'Yes'
 * // }
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
 * 将管理员对象格式化为便于展示的扁平化表示。
 *
 * 接受包含个人信息、地址和权限的管理员对象，返回一个包含展示用字段（全名、规范化邮箱、仅数字电话、地址字符串、入会日期、激活状态、角色及以逗号分隔的权限列表）的新对象。
 *
 * @param {Object} admin - 要格式化的管理员对象。
 * @param {string} admin.firstName - 名字。
 * @param {string} admin.lastName - 姓氏。
 * @param {string} admin.email - 电子邮件地址（将被小写并修剪空白）。
 * @param {string} [admin.phone] - 电话号码（非数字字符将被移除；若缺失返回 "N/A"）。
 * @param {Object} admin.address - 地址对象，包含 street、city、state、zip 字段。
 * @param {string|number} admin.createdAt - 创建时间（可被 new Date() 解析）。
 * @param {string} admin.status - 状态字符串，值为 'active' 时视为激活。
 * @param {string} admin.role - 管理员角色。
 * @param {string[]} admin.permissions - 权限字符串数组。
 * @returns {Object} 包含用于显示的字段：
 *  - fullName: 管理员全名（firstName + ' ' + lastName）。
 *  - email: 小写并修剪后的邮箱。
 *  - phone: 仅包含数字的电话号码或 'N/A'。
 *  - address: 拼接的地址字符串 "street, city, state zip"。
 *  - memberSince: 本地化格式的创建日期字符串。
 *  - isActive: 'Yes' 如果 status 为 'active'，否则 'No'。
 *  - role: 原始角色字符串。
 *  - permissions: 以逗号和空格分隔的权限列表字符串。
 *
 * @example
 * const admin = {
 *   firstName: 'Jane',
 *   lastName: 'Doe',
 *   email: '  JANE.DOE@EXAMPLE.COM ',
 *   phone: '(555) 123-4567',
 *   address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
 *   createdAt: '2020-05-10T12:34:56Z',
 *   status: 'active',
 *   role: 'superadmin',
 *   permissions: ['read', 'write', 'delete']
 * };
 * // formatAdminForDisplay(admin) => {
 * //   fullName: 'Jane Doe',
 * //   email: 'jane.doe@example.com',
 * //   phone: '5551234567',
 * //   address: '123 Main St, Springfield, IL 62701',
 * //   memberSince: '5/10/2020',
 * //   isActive: 'Yes',
 * //   role: 'superadmin',
 * //   permissions: 'read, write, delete'
 * // }
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
 * 将每个条目的 value 值乘以 2 并返回结果数组。
 *
 * @param {Array<Object>} items - 输入项数组，每项应包含数值属性 `value`（例如 { value: 3 }）。非数值或缺失 `value` 的项将导致 NaN 出现在返回数组中。
 * @returns {number[]} 一个由原始每项 `value` 乘以 2 组成的数字数组，保持与输入项顺序一致。
 * @example
 * // 返回 [2, 6, 10]
 * processItems([{ value: 1 }, { value: 3 }, { value: 5 }]);
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
 * 从多个后端端点并行顺序获取与用户相关的仪表板数据并通过回调返回聚合结果。
 *
 * 调用时会依次请求用户信息、订单、通知和推荐，并在所有响应解析完成后通过回调传回包含四个字段的对象。
 *
 * @param {string|number} userId - 要查询的用户标识。
 * @param {function(Error|null, Object=):void} callback - 完成时调用的回调，签名为 (err, result)：
 *   当发生错误（例如网络错误或响应无法解析）时，err 为 Error；成功时 err 为 null，result 为聚合对象。
 *   聚合对象结构：{ user, orders, notifications, recommendations }。
 *
 * @example
 * fetchDashboardData(123, function(err, data) {
 *   if (err) {
 *     console.error('加载仪表板数据失败', err);
 *     return;
 *   }
 *   console.log('仪表板数据', data.user, data.orders, data.notifications, data.recommendations);
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
