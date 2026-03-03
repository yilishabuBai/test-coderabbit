var fs = require('fs');
var http = require('http');

// Anti-pattern 1: Poor naming — single-letter variables, unclear function names
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

function doStuff(a) {
  var b = a * 2;
  var c = b + 1;
  return c;
}

// Anti-pattern 2: Magic numbers — hardcoded values without named constants
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

function isEligibleForDiscount(age, purchaseCount, totalSpent) {
  return age >= 18 && age <= 65 && purchaseCount > 10 && totalSpent > 500;
}

// Anti-pattern 3: God function — does too many things, too long
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

// Anti-pattern 4: Deep nesting — 5+ levels
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

// Anti-pattern 5: Duplicated code — nearly identical logic repeated
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

// Anti-pattern 7: Callback hell — deeply nested callbacks
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
