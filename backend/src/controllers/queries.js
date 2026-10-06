const mongoose = require('mongoose');
const { Customer, MenuItem, Restaurant } = require('../models');
const { parseBoolean, parseLimit } = require('../utils/http');

function numberQuery(value, key) {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw Object.assign(new Error(`${key} must be a number`), { status: 400 });
  return number;
}

function optionalId(value, key) {
  if (!value) return undefined;
  if (!mongoose.isValidObjectId(value)) throw Object.assign(new Error(`Invalid ${key}`), { status: 400 });
  return new mongoose.Types.ObjectId(value);
}

async function restaurantSummary(_request, response) {
  const data = await Restaurant.find({}, 'name cuisine rating deliveryTime')
    .sort({ rating: -1, name: 1 })
    .limit(50)
    .lean();
  response.json({ data });
}

async function topMenuItems(request, response) {
  const limit = parseLimit(request.query.limit, 10);
  const data = await MenuItem.find({}, 'name price rating isAvailable restaurantId')
    .populate('restaurantId', 'name')
    .sort({ rating: -1, price: 1 })
    .limit(limit)
    .lean();
  response.json({ data, limit });
}

async function filterMenuItems(request, response) {
  const query = request.query;
  const clauses = [];
  const minPrice = numberQuery(query.minPrice, 'minPrice');
  const maxPrice = numberQuery(query.maxPrice, 'maxPrice');
  const minRating = numberQuery(query.minRating, 'minRating');
  const restaurantId = optionalId(query.restaurantId, 'restaurantId');
  const categoryId = optionalId(query.categoryId, 'categoryId');
  const available = parseBoolean(query.available);
  if (minPrice !== undefined || maxPrice !== undefined) {
    const range = {};
    if (minPrice !== undefined) range.$gte = minPrice;
    if (maxPrice !== undefined) range.$lte = maxPrice;
    clauses.push({ price: range });
  }
  if (minRating !== undefined) clauses.push({ rating: { $gte: minRating } });
  if (restaurantId) clauses.push({ restaurantId });
  if (categoryId) clauses.push({ categoryId });
  if (available !== undefined) clauses.push({ isAvailable: available });
  if (query.search) {
    const search = new RegExp(escapeRegex(query.search.trim()), 'i');
    clauses.push({ $or: [{ name: search }, { description: search }, { tags: search }] });
  }
  if (query.ingredient) clauses.push({ ingredients: { $in: [query.ingredient] } });
  if (query.caloriesBelow !== undefined) {
    clauses.push({ 'nutrition.calories': { $lt: numberQuery(query.caloriesBelow, 'caloriesBelow') } });
  }
  const filter = clauses.length ? { $and: clauses } : {};
  const limit = parseLimit(query.limit, 50);
  const data = await MenuItem.find(filter, 'name description price rating isAvailable ingredients tags nutrition restaurantId categoryId')
    .populate('restaurantId', 'name')
    .populate('categoryId', 'name')
    .sort({ rating: -1, price: 1 })
    .limit(limit)
    .lean();
  response.json({ data, filters: query, limit });
}

async function searchRestaurants(request, response) {
  const term = String(request.query.q || '').trim();
  if (!term) return response.status(400).json({ message: 'Query parameter q is required' });
  const filter = [{ $text: { $search: term } }];
  if (request.query.cuisine) filter.push({ cuisine: new RegExp(escapeRegex(request.query.cuisine), 'i') });
  if (request.query.minRating !== undefined) filter.push({ rating: { $gte: numberQuery(request.query.minRating, 'minRating') } });
  const isOpen = parseBoolean(request.query.isOpen);
  if (isOpen !== undefined) filter.push({ isOpen });
  const data = await Restaurant.find({ $and: filter }, 'name cuisine rating deliveryTime minimumOrder isOpen description address')
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseLimit(request.query.limit, 10))
    .lean();
  response.json({ data, query: term });
}

async function searchMenuItems(request, response) {
  const term = String(request.query.q || '').trim();
  if (!term) return response.status(400).json({ message: 'Query parameter q is required' });
  const expression = new RegExp(escapeRegex(term), 'i');
  const data = await MenuItem.find({ $or: [{ name: expression }, { description: expression }, { tags: expression }] })
    .populate('restaurantId', 'name')
    .limit(parseLimit(request.query.limit, 20))
    .lean();
  response.json({ data, query: term });
}

async function comparisonExamples(_request, response) {
  const [priceAbove300, ratingAtLeast45, priceBelow200, minimumOrderAtMost200, activeCustomers, premiumCustomers, nonRegularCustomers] = await Promise.all([
    MenuItem.find({ price: { $gt: 300 } }, 'name price').limit(5).lean(),
    MenuItem.find({ rating: { $gte: 4.5 } }, 'name rating').limit(5).lean(),
    MenuItem.find({ price: { $lt: 200 } }, 'name price').limit(5).lean(),
    Restaurant.find({ minimumOrder: { $lte: 200 } }, 'name minimumOrder').limit(5).lean(),
    Customer.find({ isActive: { $ne: false } }, 'name isActive').limit(5).lean(),
    Customer.find({ membershipLevel: { $in: ['Gold', 'Platinum'] } }, 'name membershipLevel').limit(5).lean(),
    Customer.find({ membershipLevel: { $nin: ['Regular'] } }, 'name membershipLevel').limit(5).lean(),
  ]);
  response.json({
    operators: ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin'],
    data: { priceAbove300, ratingAtLeast45, priceBelow200, minimumOrderAtMost200, activeCustomers, premiumCustomers, nonRegularCustomers },
  });
}

async function logicalExamples(_request, response) {
  const [activeGoldCustomers, deliveredOrInTransit, budgetOrHighlyRated] = await Promise.all([
    Customer.find({ $and: [{ isActive: true }, { membershipLevel: { $in: ['Gold', 'Platinum'] } }] }, 'name email membershipLevel isActive').limit(20).lean(),
    require('../models').Order.find({ $or: [{ orderStatus: 'Delivered' }, { orderStatus: 'Out for Delivery' }] }, 'orderStatus totalAmount createdAt').limit(20).lean(),
    MenuItem.find({ $or: [{ price: { $lt: 250 } }, { rating: { $gte: 4.7 } }] }, 'name price rating').limit(20).lean(),
  ]);
  const notUnavailable = await MenuItem.find({ isAvailable: { $not: { $eq: false } } }, 'name isAvailable').limit(10).lean();
  response.json({ data: { activeGoldCustomers, deliveredOrInTransit, budgetOrHighlyRated, notUnavailable } });
}

async function arrayExamples(_request, response) {
  const [itemsWithPaneer, itemsWithIngredients, favoriteCustomers, carts] = await Promise.all([
    MenuItem.find({ ingredients: { $in: ['Paneer'] } }, 'name ingredients').limit(10).lean(),
    MenuItem.find({ ingredients: { $all: ['Tomato', 'Onion'] } }, 'name ingredients').limit(10).lean(),
    require('../models').Favorite.find({ restaurantIds: { $exists: true, $ne: [] } }, 'customerId restaurantIds menuItemIds').limit(10).lean(),
    require('../models').Cart.find({ 'items.0': { $exists: true } }, 'customerId items subtotal').limit(10).lean(),
  ]);
  response.json({ data: { itemsWithPaneer, itemsWithIngredients, favoriteCustomers, carts } });
}

async function embeddedExamples(_request, response) {
  const [mumbaiRestaurants, lightMenuItems] = await Promise.all([
    Restaurant.find({ 'address.city': 'Mumbai' }, 'name cuisine address.city rating').limit(20).lean(),
    MenuItem.find({ 'nutrition.calories': { $lt: 600 } }, 'name nutrition.calories price').limit(20).lean(),
  ]);
  response.json({ data: { mumbaiRestaurants, lightMenuItems } });
}

async function indexes(_request, response) {
  const collections = ['customers', 'orders', 'menu_items', 'restaurants'];
  const data = await Promise.all(collections.map(async (collection) => ({
    collection,
    indexes: await mongoose.connection.db.collection(collection).indexes(),
  })));
  response.json({ data });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  arrayExamples,
  comparisonExamples,
  embeddedExamples,
  indexes,
  logicalExamples,
  filterMenuItems,
  restaurantSummary,
  searchMenuItems,
  searchRestaurants,
  topMenuItems,
};
