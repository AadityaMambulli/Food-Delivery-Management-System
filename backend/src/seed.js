require('dotenv').config();

const mongoose = require('mongoose');
const models = require('./models');
const { connectToDatabase } = require('./config/database');

const { Customer, Address, RestaurantCategory, Restaurant, MenuCategory, MenuItem, Order, OrderItem, Payment, DeliveryPartner, Delivery, Review, Coupon, Cart, Favorite, Offer, Notification, SupportTicket } = models;

const customersData = [
  ['Aarav Sharma', 'aarav.sharma@example.com', '9876501001', 24, 'Gold'],
  ['Diya Patel', 'diya.patel@example.com', '9876501002', 22, 'Silver'],
  ['Ishaan Mehta', 'ishaan.mehta@example.com', '9876501003', 29, 'Platinum'],
  ['Ananya Iyer', 'ananya.iyer@example.com', '9876501004', 26, 'Gold'],
  ['Kabir Khan', 'kabir.khan@example.com', '9876501005', 31, 'Regular'],
  ['Meera Joshi', 'meera.joshi@example.com', '9876501006', 27, 'Silver'],
  ['Rohan Desai', 'rohan.desai@example.com', '9876501007', 23, 'Gold'],
  ['Sara Fernandes', 'sara.fernandes@example.com', '9876501008', 28, 'Regular'],
  ['Vivaan Gupta', 'vivaan.gupta@example.com', '9876501009', 34, 'Platinum'],
  ['Tara Nair', 'tara.nair@example.com', '9876501010', 25, 'Silver'],
];

const restaurantCategoriesData = [
  ['Indian', 'Regional Indian favourites'],
  ['Fast Food', 'Quick and casual meals'],
  ['Cafe', 'Coffee, snacks, and light meals'],
  ['Desserts', 'Sweets and bakery treats'],
  ['Healthy', 'Fresh and balanced choices'],
];

const restaurantData = [
  ['Bandra Biryani House', 'North Indian', 4.7, 32, 250, true, 'Slow-cooked dum biryani and Mughlai favourites.', 'Bandra West'],
  ['Dosa Junction', 'South Indian', 4.5, 28, 120, true, 'Crispy dosas, idlis, and filter coffee.', 'Andheri West'],
  ['Bombay Street Eats', 'Street Food', 4.2, 25, 100, true, 'Mumbai street food classics made fresh.', 'Dadar'],
  ['Curry Leaf Kitchen', 'Indian', 4.8, 38, 300, true, 'Comforting Indian curries and homestyle meals.', 'Powai'],
  ['Marina Pizza Co.', 'Italian', 4.3, 35, 200, false, 'Hand-stretched pizzas and baked pasta.', 'Juhu'],
  ['Green Bowl Cafe', 'Healthy', 4.6, 30, 180, true, 'Colourful salads, grain bowls, and smoothies.', 'Lower Parel'],
  ['The Sweet Room', 'Desserts', 4.1, 26, 150, true, 'Indian mithai and modern desserts.', 'Fort'],
  ['Tandoor & Co.', 'North Indian', 4.4, 40, 280, true, 'Tandoor favourites and smoky kebabs.', 'Goregaon'],
];

const menuDefinitions = [
  ['Chicken Dum Biryani', 'Main Course', 380, 4.8, ['Chicken', 'Basmati Rice', 'Yogurt'], ['Bestseller', 'Non-Veg'], 720],
  ['Paneer Tikka', 'Starters', 320, 4.6, ['Paneer', 'Yogurt', 'Spices'], ['Veg', 'Tandoor'], 480],
  ['Butter Chicken', 'Main Course', 420, 4.7, ['Chicken', 'Tomato', 'Cream'], ['Bestseller', 'Non-Veg'], 680],
  ['Masala Dosa', 'Breakfast', 180, 4.5, ['Rice', 'Lentils', 'Potato'], ['Veg', 'South Indian'], 410],
  ['Idli Sambar', 'Breakfast', 140, 4.3, ['Rice', 'Lentils', 'Onion'], ['Veg', 'South Indian'], 290],
  ['Vada Pav', 'Snacks', 60, 4.4, ['Potato', 'Chickpea Flour', 'Chilli'], ['Veg', 'Mumbai'], 330],
  ['Pav Bhaji', 'Snacks', 160, 4.6, ['Potato', 'Tomato', 'Butter'], ['Veg', 'Mumbai'], 520],
  ['Margherita Pizza', 'Main Course', 299, 4.2, ['Cheese', 'Tomato', 'Basil'], ['Veg', 'Italian'], 590],
  ['Farmhouse Pizza', 'Main Course', 399, 4.5, ['Cheese', 'Onion', 'Capsicum'], ['Veg', 'Italian'], 760],
  ['Classic Veg Burger', 'Snacks', 199, 4.1, ['Potato', 'Lettuce', 'Tomato'], ['Veg', 'Fast Food'], 540],
  ['Chicken Burger', 'Snacks', 279, 4.4, ['Chicken', 'Lettuce', 'Cheese'], ['Non-Veg', 'Fast Food'], 690],
  ['Penne Arrabbiata', 'Main Course', 320, 4.2, ['Pasta', 'Tomato', 'Garlic'], ['Veg', 'Italian'], 610],
  ['Dal Tadka', 'Main Course', 240, 4.6, ['Lentils', 'Tomato', 'Onion'], ['Veg', 'Comfort Food'], 390],
  ['Palak Paneer', 'Main Course', 310, 4.5, ['Paneer', 'Spinach', 'Cream'], ['Veg', 'North Indian'], 470],
  ['Gulab Jamun', 'Desserts', 110, 4.7, ['Milk', 'Sugar', 'Cardamom'], ['Veg', 'Dessert'], 310],
  ['Mango Lassi', 'Beverages', 130, 4.4, ['Yogurt', 'Mango', 'Sugar'], ['Veg', 'Drink'], 250],
  ['Grilled Chicken Bowl', 'Healthy', 360, 4.6, ['Chicken', 'Brown Rice', 'Lettuce'], ['High Protein', 'Healthy'], 540],
  ['Quinoa Power Bowl', 'Healthy', 340, 4.5, ['Quinoa', 'Tomato', 'Avocado'], ['Vegan', 'Healthy'], 430],
  ['Classic Brownie', 'Desserts', 150, 4.3, ['Chocolate', 'Flour', 'Butter'], ['Dessert', 'Bestseller'], 420],
  ['Rasmalai', 'Desserts', 125, 4.6, ['Milk', 'Sugar', 'Cardamom'], ['Veg', 'Dessert'], 350],
  ['Chicken Tikka', 'Starters', 350, 4.7, ['Chicken', 'Yogurt', 'Spices'], ['Non-Veg', 'Tandoor'], 510],
  ['Aloo Paratha', 'Breakfast', 150, 4.2, ['Potato', 'Wheat', 'Butter'], ['Veg', 'Breakfast'], 440],
  ['Chole Bhature', 'Main Course', 220, 4.4, ['Chickpeas', 'Tomato', 'Wheat'], ['Veg', 'North Indian'], 640],
  ['Hakka Noodles', 'Main Course', 260, 4.0, ['Noodles', 'Cabbage', 'Carrot'], ['Veg', 'Chinese'], 570],
  ['Veg Manchurian', 'Starters', 230, 4.1, ['Cabbage', 'Onion', 'Garlic'], ['Veg', 'Chinese'], 460],
  ['Filter Coffee', 'Beverages', 80, 4.8, ['Coffee', 'Milk', 'Sugar'], ['Drink', 'South Indian'], 110],
  ['Fresh Fruit Salad', 'Healthy', 210, 4.4, ['Apple', 'Banana', 'Mango'], ['Vegan', 'Healthy'], 190],
  ['Paneer Kathi Roll', 'Snacks', 240, 4.3, ['Paneer', 'Onion', 'Wheat'], ['Veg', 'Street Food'], 530],
  ['Chicken Seekh Kebab', 'Starters', 330, 4.5, ['Chicken', 'Onion', 'Spices'], ['Non-Veg', 'Tandoor'], 490],
  ['Malai Kulfi', 'Desserts', 100, 4.6, ['Milk', 'Cream', 'Pistachio'], ['Veg', 'Dessert'], 280],
];

const statuses = ['Delivered', 'Delivered', 'Delivered', 'Confirmed', 'Preparing', 'Out for Delivery', 'Pending', 'Cancelled'];
const paymentStatuses = ['Paid', 'Paid', 'Paid', 'Pending', 'Failed', 'Refunded'];

async function clearCollections() {
  await Promise.all(Object.values(models).map((Model) => Model.deleteMany({})));
}

async function seed() {
  await connectToDatabase();
  await clearCollections();

  const customers = await Customer.insertMany(customersData.map(([name, email, phone, age, membershipLevel], index) => ({
    name, email, phone, age, membershipLevel, isActive: index !== 8,
  })));

  const addresses = await Address.insertMany(customers.map((customer, index) => ({
    customerId: customer._id,
    label: index % 2 ? 'Work' : 'Home',
    addressLine: `${12 + index} ${['Hill Road', 'Linking Road', 'SV Road', 'Palm Avenue'][index % 4]}`,
    city: 'Mumbai',
    pincode: `400${index + 1}0${index % 10}`,
    location: { lat: 19.02 + index * 0.01, lng: 72.82 + index * 0.01 },
    isDefault: true,
  })));

  const restaurantCategories = await RestaurantCategory.insertMany(restaurantCategoriesData.map(([name, description]) => ({ name, description })));
  const restaurants = await Restaurant.insertMany(restaurantData.map(([name, cuisine, rating, deliveryTime, minimumOrder, isOpen, description, area], index) => ({
    name,
    cuisine,
    rating,
    deliveryTime,
    minimumOrder,
    isOpen,
    description,
    categoryId: restaurantCategories[index % restaurantCategories.length]._id,
    address: { addressLine: `${20 + index} ${area} Road`, city: 'Mumbai', pincode: `4000${index + 10}` },
  })));

  const categoryNames = [...new Set(menuDefinitions.map((item) => item[1]))];
  const menuCategories = await MenuCategory.insertMany(categoryNames.map((name) => ({
    name,
    description: `${name} favourites`,
  })));
  const menuItems = await MenuItem.insertMany(menuDefinitions.map(([name, categoryName, price, rating, ingredients, tags, calories], index) => ({
    restaurantId: restaurants[index % restaurants.length]._id,
    categoryId: menuCategories.find((category) => category.name === categoryName)._id,
    name,
    description: `${name}, freshly prepared with quality ingredients.`,
    price,
    rating,
    isAvailable: index % 7 !== 5,
    ingredients,
    nutrition: { calories, protein: Math.round(calories * 0.08), carbohydrates: Math.round(calories * 0.12), fat: Math.round(calories * 0.04) },
    tags,
  })));

  const partners = await DeliveryPartner.insertMany(Array.from({ length: 10 }, (_, index) => ({
    name: ['Amit Pawar', 'Neha Sawant', 'Rahul More', 'Pooja Jadhav', 'Sahil Shaikh'][index % 5],
    phone: `998870${1000 + index}`,
    vehicleType: ['Bike', 'Scooter', 'Bicycle'][index % 3],
    rating: Number((4 + (index % 10) / 10).toFixed(1)),
    isAvailable: index % 4 !== 0,
  })));

  const orderRows = Array.from({ length: 25 }, (_, index) => {
    const restaurantIndex = index % restaurants.length;
    const customer = customers[index % customers.length];
    const restaurant = restaurants[restaurantIndex];
    const restaurantMenu = menuItems.filter((item) => item.restaurantId.equals(restaurant._id));
    const first = restaurantMenu[index % restaurantMenu.length];
    const second = restaurantMenu[(index + 3) % restaurantMenu.length];
    const snapshotItems = [first, second].map((item, itemIndex) => {
      const quantity = itemIndex === 0 ? 1 + (index % 3) : 1;
      return { menuItemId: item._id, name: item.name, quantity, price: item.price, subtotal: item.price * quantity };
    });
    const subtotal = snapshotItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = index % 5 === 0 ? 50 : 0;
    return {
      customerId: customer._id,
      restaurantId: restaurant._id,
      items: snapshotItems,
      subtotal,
      deliveryFee: 35,
      discount,
      totalAmount: subtotal + 35 - discount,
      paymentStatus: paymentStatuses[index % paymentStatuses.length],
      orderStatus: statuses[index % statuses.length],
      deliveryAddress: {
        addressLine: addresses[index % addresses.length].addressLine,
        city: 'Mumbai',
        pincode: addresses[index % addresses.length].pincode,
        landmark: index % 2 ? 'Near station' : 'Opposite garden',
      },
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    };
  });
  const orders = await Order.insertMany(orderRows);

  const orderItems = [];
  const payments = [];
  const deliveries = [];
  const reviews = [];
  for (let index = 0; index < orders.length; index += 1) {
    const order = orders[index];
    for (const item of order.items) {
      orderItems.push({ orderId: order._id, menuItemId: item.menuItemId, quantity: item.quantity, price: item.price, subtotal: item.subtotal });
    }
    payments.push({
      orderId: order._id,
      amount: order.totalAmount,
      method: ['UPI', 'Card', 'Cash', 'Net Banking'][index % 4],
      status: order.paymentStatus,
      transactionDate: order.createdAt,
    });
    deliveries.push({
      orderId: order._id,
      deliveryPartnerId: partners[index % partners.length]._id,
      status: order.orderStatus === 'Delivered' ? 'Delivered' : order.orderStatus === 'Cancelled' ? 'Cancelled' : ['Assigned', 'Picked Up', 'On the Way'][index % 3],
      pickupTime: order.createdAt,
      deliveryTime: order.orderStatus === 'Delivered' ? new Date(order.createdAt.getTime() + 35 * 60 * 1000) : undefined,
      estimatedMinutes: 25 + (index % 20),
    });
    if (index < 20) {
      reviews.push({
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        menuItemId: order.items[0].menuItemId,
        rating: 3 + (index % 3),
        comment: ['Delicious and delivered hot.', 'Great value for money.', 'Fresh and flavourful food.'][index % 3],
      });
    }
  }
  await Promise.all([
    OrderItem.insertMany(orderItems),
    Payment.insertMany(payments),
    Delivery.insertMany(deliveries),
    Review.insertMany(reviews),
  ]);

  await Coupon.insertMany(Array.from({ length: 8 }, (_, index) => ({
    code: `MUMBAI${10 + index}`,
    description: index % 2 ? 'Flat savings on your meal' : 'A little off your next order',
    discountType: index % 2 ? 'Fixed' : 'Percentage',
    discountValue: index % 2 ? 75 + index * 5 : 10 + index,
    minimumOrder: 199 + index * 50,
    expiryDate: new Date(Date.now() + (30 + index) * 24 * 60 * 60 * 1000),
    isActive: index !== 7,
  })));

  await Cart.insertMany(customers.slice(0, 8).map((customer, index) => {
    const restaurant = restaurants[index % restaurants.length];
    const items = menuItems.filter((item) => item.restaurantId.equals(restaurant._id)).slice(0, 2).map((item, itemIndex) => ({
      menuItemId: item._id,
      quantity: itemIndex + 1,
      price: item.price,
    }));
    return { customerId: customer._id, restaurantId: restaurant._id, items, subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
  }));

  await Favorite.insertMany(customers.map((customer, index) => ({
    customerId: customer._id,
    restaurantIds: [restaurants[index % restaurants.length]._id, restaurants[(index + 2) % restaurants.length]._id],
    menuItemIds: [menuItems[index % menuItems.length]._id],
  })));

  await Offer.insertMany(Array.from({ length: 10 }, (_, index) => ({
    restaurantId: restaurants[index % restaurants.length]._id,
    title: ['Lunch Special', 'Weekend Treat', 'Mumbai Monsoon Deal'][index % 3],
    description: 'Save on selected favourites this week.',
    discountPercentage: 10 + (index % 4) * 5,
    validUntil: new Date(Date.now() + (7 + index) * 24 * 60 * 60 * 1000),
    isActive: index % 4 !== 0,
  })));

  await Notification.insertMany(Array.from({ length: 20 }, (_, index) => ({
    customerId: customers[index % customers.length]._id,
    title: ['Order update', 'Fresh offer for you', 'Welcome to FoodDash'][index % 3],
    message: ['Your meal is on its way.', 'Use a coupon on your next order.', 'Thanks for choosing local restaurants.'][index % 3],
    type: ['Order', 'Offer', 'Account'][index % 3],
    isRead: index % 3 === 0,
  })));

  await SupportTicket.insertMany(Array.from({ length: 10 }, (_, index) => ({
    customerId: customers[index % customers.length]._id,
    orderId: orders[index]._id,
    subject: ['Order delivery update', 'Missing item', 'Invoice request', 'Feedback'][index % 4],
    message: 'Please help me with this order. Thank you.',
    priority: ['Low', 'Medium', 'High'][index % 3],
    status: ['Open', 'In Progress', 'Resolved'][index % 3],
    messages: [{ sender: 'Customer', body: 'Please help me with this order.', sentAt: new Date() }],
  })));

  await Promise.all(Object.values(models).map((Model) => Model.createCollection().catch((error) => {
    if (error.codeName !== 'NamespaceExists') throw error;
  })));
  await Promise.all(Object.values(models).map((Model) => Model.syncIndexes()));

  const counts = {};
  for (const [name, Model] of Object.entries(models)) counts[Model.collection.collectionName] = await Model.countDocuments();
  console.log('Seed complete:', JSON.stringify(counts, null, 2));
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
