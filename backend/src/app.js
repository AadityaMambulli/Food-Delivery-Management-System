const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    backend: 'running',
    database: {
      name: mongoose.connection.name || 'food_delivery_db',
      status: databaseConnected ? 'connected' : 'disconnected',
    },
  });
});

app.use('/api', apiRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'Endpoint not found' });
});

app.use((error, _request, response, _next) => {
  if (error.code === 11000) {
    return response.status(409).json({ message: 'A record with this unique value already exists' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: error.message });
  }
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error('API request failed:', error);
  return response.status(status).json({ message: status >= 500 ? 'Internal server error' : error.message });
});

module.exports = app;
