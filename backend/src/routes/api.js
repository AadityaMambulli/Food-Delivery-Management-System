const express = require('express');
const { asyncHandler } = require('../utils/http');
const resources = require('../controllers/resources');
const queries = require('../controllers/queries');
const reports = require('../controllers/reports');

const router = express.Router();

router.get('/dashboard', asyncHandler(reports.dashboard));
router.get('/restaurants/summary', asyncHandler(queries.restaurantSummary));
router.get('/search/restaurants', asyncHandler(queries.searchRestaurants));
router.get('/search/menu-items', asyncHandler(queries.searchMenuItems));
router.get('/menu-items/top', asyncHandler(queries.topMenuItems));
router.get('/menu-items/filter', asyncHandler(queries.filterMenuItems));
router.get('/queries/logical', asyncHandler(queries.logicalExamples));
router.get('/queries/comparison', asyncHandler(queries.comparisonExamples));
router.get('/queries/arrays', asyncHandler(queries.arrayExamples));
router.get('/queries/embedded', asyncHandler(queries.embeddedExamples));
router.get('/indexes', asyncHandler(queries.indexes));
router.get('/reports/restaurant-revenue', asyncHandler(reports.restaurantRevenue));
router.get('/reports/customer-spending', asyncHandler(reports.customerSpending));
router.get('/reports/order-status', asyncHandler(reports.orderStatus));
router.get('/reports/top-menu-items', asyncHandler(reports.topMenuItems));

router.get('/:resource', asyncHandler(resources.listResources));
router.post('/:resource', asyncHandler((request, response, next) => {
  if (!resources.resourceModels[request.params.resource]) {
    return response.status(404).json({ message: 'Resource not found' });
  }
  return resources.createResource(request, response, next);
}));
router.get('/:resource/:id', asyncHandler((request, response, next) => {
  if (!resources.resourceModels[request.params.resource]) {
    return response.status(404).json({ message: 'Resource not found' });
  }
  return resources.getResource(request, response, next);
}));
router.put('/:resource/:id', asyncHandler((request, response, next) => {
  if (!resources.crudResources.has(request.params.resource)) {
    return response.status(405).json({ message: 'Updates are enabled for customers, restaurants, menu-items, and orders only' });
  }
  return resources.updateResource(request, response, next);
}));
router.delete('/:resource/:id', asyncHandler((request, response, next) => {
  if (!resources.crudResources.has(request.params.resource)) {
    return response.status(405).json({ message: 'Deletes are enabled for customers, restaurants, menu-items, and orders only' });
  }
  return resources.deleteResource(request, response, next);
}));

module.exports = router;
