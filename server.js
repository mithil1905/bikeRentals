const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// REST API ROUTES FOR CRUD OPERATIONS
// -------------------------------------------------------------

// 1. SYSTEM STATS & DB STATUS
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. BIKES CRUD API
// READ: Get all bikes (with optional category, location, search filtering)
app.get('/api/bikes', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    const bikes = await db.getBikes(category, location, search);
    res.json({ success: true, count: bikes.length, data: bikes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// READ: Get single bike by ID
app.get('/api/bikes/:id', async (req, res) => {
  try {
    const bike = await db.getBikeById(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, error: 'Bike not found' });
    }
    res.json({ success: true, data: bike });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE: Add new bike to fleet
app.post('/api/bikes', async (req, res) => {
  try {
    const { name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status } = req.body;
    if (!name || !brand || !category || !price_per_day || !location) {
      return res.status(400).json({ success: false, error: 'Please provide all required bike details (name, brand, category, price, location)' });
    }
    const newBike = await db.addBike(req.body);
    res.status(201).json({ success: true, message: 'Bike added successfully to Bharat fleet!', data: newBike });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE: Modify bike details or status
app.put('/api/bikes/:id', async (req, res) => {
  try {
    const updated = await db.updateBike(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Bike not found to update' });
    }
    res.json({ success: true, message: 'Bike updated successfully!', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Remove bike from fleet
app.delete('/api/bikes/:id', async (req, res) => {
  try {
    const deleted = await db.deleteBike(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Bike not found or already removed' });
    }
    res.json({ success: true, message: 'Bike deleted successfully from fleet' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. RENTALS CRUD API
// READ: Get all rental bookings
app.get('/api/rentals', async (req, res) => {
  try {
    const rentals = await db.getRentals();
    res.json({ success: true, count: rentals.length, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE: Book a new bike rental
app.post('/api/rentals', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_aadhaar, bike_id, start_date, days, total_amount, pickup_location } = req.body;
    if (!customer_name || !customer_phone || !customer_aadhaar || !bike_id || !start_date || !days) {
      return res.status(400).json({ success: false, error: 'Please fill in all customer and booking fields' });
    }
    const newRental = await db.addRental(req.body);
    res.status(201).json({ success: true, message: 'Booking confirmed! Safe travels across Bharat.', data: newRental });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE: Update rental (extend days or mark Completed / Cancelled)
app.put('/api/rentals/:id', async (req, res) => {
  try {
    const updated = await db.updateRental(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking record not found' });
    }
    res.json({ success: true, message: 'Booking status updated successfully!', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Cancel / remove booking
app.delete('/api/rentals/:id', async (req, res) => {
  try {
    const deleted = await db.deleteRental(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Booking record not found or already deleted' });
    }
    res.json({ success: true, message: 'Booking cancelled & removed. Bike returned to Available fleet.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback HTML routing for multi-page application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`\n==========================================================`);
    console.log(`🏍️  BHARAT BIKE RENTAL SYSTEM (यात्री व्हील्स) IS RUNNING!`);
    console.log(`🌐  Local URL: http://localhost:${PORT}`);
    console.log(`📡  API Endpoint: http://localhost:${PORT}/api/bikes`);
    console.log(`==========================================================\n`);
  });
}

startServer();
