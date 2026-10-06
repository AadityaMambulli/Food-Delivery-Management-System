const { Order } = require('../models');

async function restaurantRevenue(_request, response) {
  const data = await Order.aggregate([
    { $match: { orderStatus: 'Delivered' } },
    {
      $group: {
        _id: '$restaurantId',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },
    {
      $project: {
        _id: 0,
        restaurantId: '$_id',
        restaurant: '$restaurant.name',
        totalOrders: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
      },
    },
  ]);
  response.json({ data });
}

async function customerSpending(_request, response) {
  const data = await Order.aggregate([
    { $match: { orderStatus: 'Delivered' } },
    {
      $group: {
        _id: '$customerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalSpent: -1 } },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    {
      $project: {
        _id: 0,
        customerId: '$_id',
        customer: '$customer.name',
        totalOrders: 1,
        totalSpent: { $round: ['$totalSpent', 2] },
      },
    },
  ]);
  response.json({ data });
}

async function orderStatus(_request, response) {
  const data = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        orderCount: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { orderCount: -1, _id: 1 } },
    {
      $project: {
        _id: 0,
        status: '$_id',
        orderCount: 1,
        totalValue: { $round: ['$totalValue', 2] },
      },
    },
  ]);
  response.json({ data });
}

async function topMenuItems(_request, response) {
  const data = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        name: { $first: '$items.name' },
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, name: 1, quantitySold: 1, revenue: { $round: ['$revenue', 2] } } },
  ]);
  response.json({ data });
}

async function dashboard(_request, response) {
  const { Customer, Restaurant, MenuItem } = require('../models');
  const [customers, restaurants, menuItems, orders, delivered] = await Promise.all([
    Customer.countDocuments(),
    Restaurant.countDocuments(),
    MenuItem.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, deliveredOrders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]),
  ]);
  response.json({
    data: {
      customers,
      restaurants,
      menuItems,
      orders,
      deliveredOrders: delivered[0]?.deliveredOrders || 0,
      totalRevenue: delivered[0]?.revenue || 0,
    },
  });
}

module.exports = { customerSpending, dashboard, orderStatus, restaurantRevenue, topMenuItems };
