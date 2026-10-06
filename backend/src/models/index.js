const mongoose = require('mongoose');

const { Schema } = mongoose;
const objectId = Schema.Types.ObjectId;

const addressSnapshot = new Schema(
  {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
  },
  { _id: false },
);

const nutrition = new Schema(
  {
    calories: { type: Number, min: 0, default: 0 },
    protein: { type: Number, min: 0, default: 0 },
    carbohydrates: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const orderItemSnapshot = new Schema(
  {
    menuItemId: { type: objectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const schemas = {
  Customer: {
    collection: 'customers',
    definition: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      age: { type: Number, min: 13, max: 110, default: 25 },
      membershipLevel: { type: String, enum: ['Regular', 'Silver', 'Gold', 'Platinum'], default: 'Regular' },
      isActive: { type: Boolean, default: true },
    },
    indexes: [[{ email: 1 }, { unique: true }]],
  },
  Address: {
    collection: 'addresses',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true, index: true },
      label: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true, index: true },
      pincode: { type: String, required: true },
      location: { lat: Number, lng: Number },
      isDefault: { type: Boolean, default: false },
    },
  },
  RestaurantCategory: {
    collection: 'restaurant_categories',
    definition: {
      name: { type: String, required: true, unique: true },
      description: String,
    },
  },
  Restaurant: {
    collection: 'restaurants',
    definition: {
      name: { type: String, required: true, trim: true },
      cuisine: { type: String, required: true, index: true },
      categoryId: { type: objectId, ref: 'RestaurantCategory', required: true },
      rating: { type: Number, min: 0, max: 5, default: 0 },
      deliveryTime: { type: Number, min: 1, default: 35 },
      minimumOrder: { type: Number, min: 0, default: 0 },
      isOpen: { type: Boolean, default: true },
      description: { type: String, default: '' },
      address: { addressLine: String, city: { type: String, required: true }, pincode: String },
    },
    indexes: [[{ name: 'text', cuisine: 'text', description: 'text' }, {}]],
  },
  MenuCategory: {
    collection: 'menu_categories',
    definition: {
      name: { type: String, required: true, unique: true },
      description: String,
    },
  },
  MenuItem: {
    collection: 'menu_items',
    definition: {
      restaurantId: { type: objectId, ref: 'Restaurant', required: true, index: true },
      categoryId: { type: objectId, ref: 'MenuCategory', required: true },
      name: { type: String, required: true, trim: true },
      description: { type: String, default: '' },
      price: { type: Number, required: true, min: 0 },
      rating: { type: Number, min: 0, max: 5, default: 4 },
      isAvailable: { type: Boolean, default: true },
      ingredients: { type: [String], default: [] },
      nutrition: { type: nutrition, default: () => ({}) },
      tags: { type: [String], default: [] },
    },
  },
  Order: {
    collection: 'orders',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true },
      restaurantId: { type: objectId, ref: 'Restaurant', required: true },
      items: { type: [orderItemSnapshot], required: true, validate: (items) => items.length > 0 },
      subtotal: { type: Number, required: true, min: 0 },
      deliveryFee: { type: Number, min: 0, default: 0 },
      discount: { type: Number, min: 0, default: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
      orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
      deliveryAddress: { type: addressSnapshot, required: true },
    },
    indexes: [[{ customerId: 1, createdAt: -1 }, {}]],
  },
  OrderItem: {
    collection: 'order_items',
    definition: {
      orderId: { type: objectId, ref: 'Order', required: true, index: true },
      menuItemId: { type: objectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      subtotal: { type: Number, required: true, min: 0 },
    },
  },
  Payment: {
    collection: 'payments',
    definition: {
      orderId: { type: objectId, ref: 'Order', required: true, index: true },
      amount: { type: Number, required: true, min: 0 },
      method: { type: String, enum: ['UPI', 'Card', 'Cash', 'Net Banking'], required: true },
      status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], required: true },
      transactionDate: { type: Date, default: Date.now },
    },
  },
  DeliveryPartner: {
    collection: 'delivery_partners',
    definition: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Bicycle'], default: 'Bike' },
      rating: { type: Number, min: 0, max: 5, default: 4 },
      isAvailable: { type: Boolean, default: true },
    },
  },
  Delivery: {
    collection: 'deliveries',
    definition: {
      orderId: { type: objectId, ref: 'Order', required: true, unique: true },
      deliveryPartnerId: { type: objectId, ref: 'DeliveryPartner', required: true },
      status: { type: String, enum: ['Assigned', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'], default: 'Assigned' },
      pickupTime: Date,
      deliveryTime: Date,
      estimatedMinutes: { type: Number, min: 1, default: 30 },
    },
  },
  Review: {
    collection: 'reviews',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true },
      restaurantId: { type: objectId, ref: 'Restaurant', required: true },
      menuItemId: { type: objectId, ref: 'MenuItem' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, default: '' },
    },
  },
  Coupon: {
    collection: 'coupons',
    definition: {
      code: { type: String, required: true, unique: true, uppercase: true, trim: true },
      description: { type: String, required: true },
      discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
      discountValue: { type: Number, required: true, min: 1 },
      minimumOrder: { type: Number, min: 0, default: 0 },
      expiryDate: { type: Date, required: true },
      isActive: { type: Boolean, default: true },
    },
  },
  Cart: {
    collection: 'cart',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true, unique: true },
      restaurantId: { type: objectId, ref: 'Restaurant', required: true },
      items: [{
        menuItemId: { type: objectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      }],
      subtotal: { type: Number, min: 0, default: 0 },
    },
  },
  Favorite: {
    collection: 'favorites',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true, unique: true },
      restaurantIds: [{ type: objectId, ref: 'Restaurant' }],
      menuItemIds: [{ type: objectId, ref: 'MenuItem' }],
    },
  },
  Offer: {
    collection: 'offers',
    definition: {
      restaurantId: { type: objectId, ref: 'Restaurant', required: true },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      discountPercentage: { type: Number, required: true, min: 1, max: 100 },
      validUntil: { type: Date, required: true },
      isActive: { type: Boolean, default: true },
    },
  },
  Notification: {
    collection: 'notifications',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true, index: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      type: { type: String, enum: ['Order', 'Offer', 'Account', 'Support'], default: 'Order' },
      isRead: { type: Boolean, default: false },
    },
  },
  SupportTicket: {
    collection: 'support_tickets',
    definition: {
      customerId: { type: objectId, ref: 'Customer', required: true },
      orderId: { type: objectId, ref: 'Order' },
      subject: { type: String, required: true },
      message: { type: String, required: true },
      priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
      status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
      messages: [{ sender: String, body: String, sentAt: { type: Date, default: Date.now } }],
    },
  },
};

const models = Object.fromEntries(
  Object.entries(schemas).map(([name, config]) => {
    const schema = new Schema(config.definition, { timestamps: true, collection: config.collection });
    for (const [fields, options] of config.indexes || []) schema.index(fields, options);
    return [name, mongoose.models[name] || mongoose.model(name, schema)];
  }),
);

module.exports = models;
