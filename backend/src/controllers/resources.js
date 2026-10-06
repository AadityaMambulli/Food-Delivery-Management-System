const mongoose = require('mongoose');
const models = require('../models');
const { parseBoolean, parseLimit } = require('../utils/http');

const populateFields = {
  restaurants: [{ path: 'categoryId', select: 'name' }],
  'menu-items': [{ path: 'restaurantId', select: 'name' }, { path: 'categoryId', select: 'name' }],
  orders: [{ path: 'customerId', select: 'name email' }, { path: 'restaurantId', select: 'name' }],
  addresses: [{ path: 'customerId', select: 'name' }],
  deliveries: [{ path: 'orderId', select: 'orderStatus totalAmount' }, { path: 'deliveryPartnerId', select: 'name' }],
};

const resourceModels = {
  customers: models.Customer,
  addresses: models.Address,
  restaurants: models.Restaurant,
  'restaurant-categories': models.RestaurantCategory,
  'menu-items': models.MenuItem,
  'menu-categories': models.MenuCategory,
  orders: models.Order,
  'order-items': models.OrderItem,
  payments: models.Payment,
  'delivery-partners': models.DeliveryPartner,
  deliveries: models.Delivery,
  reviews: models.Review,
  coupons: models.Coupon,
  cart: models.Cart,
  favorites: models.Favorite,
  offers: models.Offer,
  notifications: models.Notification,
  'support-tickets': models.SupportTicket,
};

const crudResources = new Set(['customers', 'restaurants', 'menu-items', 'orders']);

function buildListFilter(resource, query) {
  const filter = {};
  const clauses = [];
  const active = parseBoolean(query.active);
  const available = parseBoolean(query.available);
  const isOpen = parseBoolean(query.isOpen);
  const isAvailable = parseBoolean(query.isAvailable);
  const status = query.status || query.orderStatus;

  if (resource === 'customers') {
    if (active !== undefined) filter.isActive = active;
    if (query.membershipLevel) filter.membershipLevel = query.membershipLevel;
  }
  if (resource === 'restaurants') {
    if (isOpen !== undefined) filter.isOpen = isOpen;
    if (query.cuisine) filter.cuisine = new RegExp(escapeRegex(query.cuisine), 'i');
    if (query.minRating !== undefined) filter.rating = { $gte: finiteNumber(query.minRating, 'minRating') };
  }
  if (resource === 'menu-items') {
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (available !== undefined) filter.isAvailable = available;
    if (query.restaurantId) filter.restaurantId = toObjectId(query.restaurantId, 'restaurantId');
    if (query.categoryId) filter.categoryId = toObjectId(query.categoryId, 'categoryId');
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = finiteNumber(query.minPrice, 'minPrice');
      if (query.maxPrice !== undefined) filter.price.$lte = finiteNumber(query.maxPrice, 'maxPrice');
    }
    if (query.minRating !== undefined) filter.rating = { $gte: finiteNumber(query.minRating, 'minRating') };
    if (query.search) {
      const search = new RegExp(escapeRegex(query.search), 'i');
      clauses.push({ $or: [{ name: search }, { description: search }, { tags: search }] });
    }
    if (query.ingredient) filter.ingredients = { $in: [query.ingredient] };
  }
  if (resource === 'orders') {
    if (status) filter.orderStatus = status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      filter.totalAmount = {};
      if (query.minAmount !== undefined) filter.totalAmount.$gte = finiteNumber(query.minAmount, 'minAmount');
      if (query.maxAmount !== undefined) filter.totalAmount.$lte = finiteNumber(query.maxAmount, 'maxAmount');
    }
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = validDate(query.from, 'from');
      if (query.to) filter.createdAt.$lte = validDate(query.to, 'to');
    }
  }
  if (resource === 'reviews' && query.restaurantId) filter.restaurantId = toObjectId(query.restaurantId, 'restaurantId');
  if (clauses.length) filter.$and = clauses;
  return filter;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function finiteNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw Object.assign(new Error(`${name} must be a number`), { status: 400 });
  return number;
}

function validDate(value, name) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw Object.assign(new Error(`${name} must be a valid date`), { status: 400 });
  return date;
}

function toObjectId(value, name = 'id') {
  if (!mongoose.isValidObjectId(value)) throw Object.assign(new Error(`Invalid ${name}`), { status: 400 });
  return new mongoose.Types.ObjectId(value);
}

function findQuery(resource, filter = {}) {
  const query = resourceModels[resource].find(filter);
  for (const populate of populateFields[resource] || []) query.populate(populate);
  return query;
}

async function listResources(request, response) {
  const { resource } = request.params;
  const Model = resourceModels[resource];
  if (!Model) return response.status(404).json({ message: 'Resource not found' });

  const limit = parseLimit(request.query.limit);
  const page = parseLimit(request.query.page, 1, 100000);
  const items = await findQuery(resource, buildListFilter(resource, request.query))
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const total = await Model.countDocuments(buildListFilter(resource, request.query));
  response.json({ data: items, pagination: { page, limit, total } });
}

async function getResource(request, response) {
  const { resource, id } = request.params;
  if (!mongoose.isValidObjectId(id)) return response.status(400).json({ message: 'Invalid id' });
  const query = resourceModels[resource].findById(id);
  for (const populate of populateFields[resource] || []) query.populate(populate);
  const item = await query.lean();
  if (!item) return response.status(404).json({ message: 'Record not found' });
  response.json({ data: item });
}

async function createResource(request, response) {
  const { resource } = request.params;
  const item = await resourceModels[resource].create(request.body);
  response.status(201).json({ data: item });
}

async function updateResource(request, response) {
  const { resource, id } = request.params;
  if (!mongoose.isValidObjectId(id)) return response.status(400).json({ message: 'Invalid id' });
  const item = await resourceModels[resource].findByIdAndUpdate(id, request.body, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  if (!item) return response.status(404).json({ message: 'Record not found' });
  response.json({ data: item });
}

async function deleteResource(request, response) {
  const { resource, id } = request.params;
  if (!mongoose.isValidObjectId(id)) return response.status(400).json({ message: 'Invalid id' });
  const item = await resourceModels[resource].findByIdAndDelete(id);
  if (!item) return response.status(404).json({ message: 'Record not found' });
  response.json({ message: 'Record deleted', id });
}

function getResourceModel(resource) {
  return resourceModels[resource];
}

module.exports = {
  buildListFilter,
  createResource,
  crudResources,
  deleteResource,
  findQuery,
  getResource,
  getResourceModel,
  listResources,
  resourceModels,
  updateResource,
};
