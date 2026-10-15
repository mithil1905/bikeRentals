const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isConnected = false;

// Fallback in-memory dataset in case MySQL credentials are not yet configured in .env
let fallbackBikes = [
  {
    id: 1,
    name: 'Royal Enfield Classic 350',
    brand: 'Royal Enfield',
    category: 'Cruiser',
    engine_cc: '349 cc',
    price_per_day: 1299.00,
    fuel_type: 'Petrol',
    location: 'Goa - Calangute Hub',
    image_url: '/images/hero_ladakh.jpg',
    status: 'Rented',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Royal Enfield Himalayan 450',
    brand: 'Royal Enfield',
    category: 'Adventure',
    engine_cc: '452 cc',
    price_per_day: 1599.00,
    fuel_type: 'Petrol',
    location: 'Manali - Mall Road Hub',
    image_url: '/images/rider_booking.jpg',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Honda Activa 6G',
    brand: 'Honda',
    category: 'Scooty',
    engine_cc: '109 cc',
    price_per_day: 399.00,
    fuel_type: 'Petrol',
    location: 'Bengaluru - Koramangala Hub',
    image_url: '/images/goa_beach.jpg',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Bajaj Pulsar NS200',
    brand: 'Bajaj',
    category: 'Sport',
    engine_cc: '199.5 cc',
    price_per_day: 699.00,
    fuel_type: 'Petrol',
    location: 'Mumbai - Bandra Hub',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Ather 450X Gen 3',
    brand: 'Ather Energy',
    category: 'Electric',
    engine_cc: '3.7 kWh Battery',
    price_per_day: 499.00,
    fuel_type: 'Electric',
    location: 'Bengaluru - Indiranagar Hub',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'KTM 250 Duke',
    brand: 'KTM',
    category: 'Sport',
    engine_cc: '248.8 cc',
    price_per_day: 1099.00,
    fuel_type: 'Petrol',
    location: 'Delhi - Connaught Place Hub',
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'TVS Jupiter 125',
    brand: 'TVS',
    category: 'Scooty',
    engine_cc: '124.8 cc',
    price_per_day: 420.00,
    fuel_type: 'Petrol',
    location: 'Jaipur - MI Road Hub',
    image_url: '/images/goa_beach.jpg',
    status: 'Available',
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Yamaha YZF R15 V4',
    brand: 'Yamaha',
    category: 'Sport',
    engine_cc: '155 cc',
    price_per_day: 899.00,
    fuel_type: 'Petrol',
    location: 'Goa - Anjuna Hub',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    status: 'Available',
    created_at: new Date().toISOString()
  }
];

let fallbackRentals = [
  {
    id: 1,
    customer_name: 'Aarav Sharma',
    customer_phone: '9876543210',
    customer_aadhaar: '4589 1234 5678',
    bike_id: 1,
    bike_name: 'Royal Enfield Classic 350',
    start_date: new Date().toISOString().split('T')[0],
    days: 3,
    total_amount: 3897.00,
    pickup_location: 'Goa - Calangute Hub',
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    customer_name: 'Priya Nair',
    customer_phone: '9845123456',
    customer_aadhaar: '8976 5432 1098',
    bike_id: 3,
    bike_name: 'Honda Activa 6G',
    start_date: '2026-10-12',
    days: 2,
    total_amount: 798.00,
    pickup_location: 'Bengaluru - Koramangala Hub',
    status: 'Completed',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    customer_name: 'Rohan Verma',
    customer_phone: '9123456780',
    customer_aadhaar: 'DL-0420220019283',
    bike_id: 2,
    bike_name: 'Royal Enfield Himalayan 450',
    start_date: '2026-10-15',
    days: 5,
    total_amount: 7995.00,
    pickup_location: 'Manali - Mall Road Hub',
    status: 'Active',
    created_at: new Date().toISOString()
  }
];

let nextBikeId = 9;
let nextRentalId = 4;

async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mithil',
      database: process.env.DB_NAME || 'bike_rental_db',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log('✅ Connected successfully to MySQL Database: ' + (process.env.DB_NAME || 'bike_rental_db'));
  } catch (err) {
    isConnected = false;
    console.warn('\n⚠️ [MySQL Notice]: Could not connect to MySQL Server with current .env credentials.');
    console.warn('Reason: ' + err.message);
    console.warn('👉 To connect your MySQL database:');
    console.warn('   1. Execute "database/schema.sql" in MySQL Workbench.');
    console.warn('   2. Update DB_PASSWORD in your .env file with your MySQL root password.');
    console.warn('🚀 Running in seamless fallback mode so localhost:3000 works immediately!\n');
  }
}

// Database helper methods for CRUD
const db = {
  initDb,
  isLive: () => isConnected,

  // BIKES CRUD
  async getBikes(category, location, search) {
    if (isConnected) {
      let sql = 'SELECT * FROM bikes WHERE 1=1';
      const params = [];
      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (location && location !== 'All') {
        sql += ' AND location LIKE ?';
        params.push(`%${location}%`);
      }
      if (search) {
        sql += ' AND (name LIKE ? OR brand LIKE ? OR location LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      sql += ' ORDER BY id DESC';
      const [rows] = await pool.query(sql, params);
      return rows;
    } else {
      let filtered = [...fallbackBikes];
      if (category && category !== 'All') {
        filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
      }
      if (location && location !== 'All') {
        filtered = filtered.filter(b => b.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(b => b.name.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s) || b.location.toLowerCase().includes(s));
      }
      return filtered.sort((a, b) => b.id - a.id);
    }
  },

  async getBikeById(id) {
    if (isConnected) {
      const [rows] = await pool.query('SELECT * FROM bikes WHERE id = ?', [id]);
      return rows[0] || null;
    } else {
      return fallbackBikes.find(b => b.id === Number(id)) || null;
    }
  },

  async addBike(bikeData) {
    const { name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status } = bikeData;
    const finalImage = image_url && image_url.trim() !== '' ? image_url : '/images/hero_ladakh.jpg';
    const finalStatus = status || 'Available';

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO bikes (name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, brand, category, engine_cc, price_per_day, fuel_type || 'Petrol', location, finalImage, finalStatus]
      );
      return { id: res.insertId, ...bikeData, image_url: finalImage, status: finalStatus };
    } else {
      const newBike = {
        id: nextBikeId++,
        name,
        brand,
        category,
        engine_cc,
        price_per_day: Number(price_per_day),
        fuel_type: fuel_type || 'Petrol',
        location,
        image_url: finalImage,
        status: finalStatus,
        created_at: new Date().toISOString()
      };
      fallbackBikes.unshift(newBike);
      return newBike;
    }
  },

  async updateBike(id, bikeData) {
    const { name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status } = bikeData;

    if (isConnected) {
      await pool.query(
        'UPDATE bikes SET name=?, brand=?, category=?, engine_cc=?, price_per_day=?, fuel_type=?, location=?, image_url=?, status=? WHERE id=?',
        [name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status, id]
      );
      return { id: Number(id), ...bikeData };
    } else {
      const index = fallbackBikes.findIndex(b => b.id === Number(id));
      if (index !== -1) {
        fallbackBikes[index] = { ...fallbackBikes[index], ...bikeData, id: Number(id) };
        return fallbackBikes[index];
      }
      return null;
    }
  },

  async deleteBike(id) {
    if (isConnected) {
      const [res] = await pool.query('DELETE FROM bikes WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const initLen = fallbackBikes.length;
      fallbackBikes = fallbackBikes.filter(b => b.id !== Number(id));
      return fallbackBikes.length < initLen;
    }
  },

  // RENTALS CRUD
  async getRentals() {
    if (isConnected) {
      const sql = `
        SELECT r.*, b.name as bike_name, b.image_url as bike_image, b.price_per_day as bike_price
        FROM rentals r
        LEFT JOIN bikes b ON r.bike_id = b.id
        ORDER BY r.id DESC
      `;
      const [rows] = await pool.query(sql);
      return rows;
    } else {
      return fallbackRentals.map(r => {
        const b = fallbackBikes.find(bike => bike.id === Number(r.bike_id));
        return {
          ...r,
          bike_name: b ? b.name : (r.bike_name || 'Generic Bike'),
          bike_image: b ? b.image_url : '/images/hero_ladakh.jpg',
          bike_price: b ? b.price_per_day : 500
        };
      }).sort((a, b) => b.id - a.id);
    }
  },

  async addRental(rentalData) {
    const { customer_name, customer_phone, customer_aadhaar, bike_id, start_date, days, total_amount, pickup_location } = rentalData;

    if (isConnected) {
      const [res] = await pool.query(
        'INSERT INTO rentals (customer_name, customer_phone, customer_aadhaar, bike_id, start_date, days, total_amount, pickup_location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [customer_name, customer_phone, customer_aadhaar, bike_id, start_date, days, total_amount, pickup_location, 'Active']
      );
      // Mark bike as Rented
      await pool.query('UPDATE bikes SET status = "Rented" WHERE id = ?', [bike_id]);
      return { id: res.insertId, ...rentalData, status: 'Active' };
    } else {
      const b = fallbackBikes.find(bike => bike.id === Number(bike_id));
      if (b) b.status = 'Rented';

      const newRental = {
        id: nextRentalId++,
        customer_name,
        customer_phone,
        customer_aadhaar,
        bike_id: Number(bike_id),
        bike_name: b ? b.name : 'Unknown Bike',
        start_date,
        days: Number(days),
        total_amount: Number(total_amount),
        pickup_location,
        status: 'Active',
        created_at: new Date().toISOString()
      };
      fallbackRentals.unshift(newRental);
      return newRental;
    }
  },

  async updateRental(id, rentalData) {
    const { status, days, total_amount } = rentalData;

    if (isConnected) {
      if (days && total_amount) {
        await pool.query('UPDATE rentals SET status = ?, days = ?, total_amount = ? WHERE id = ?', [status, days, total_amount, id]);
      } else {
        await pool.query('UPDATE rentals SET status = ? WHERE id = ?', [status, id]);
      }

      // If status changed to Completed or Cancelled, free up the bike
      if (status === 'Completed' || status === 'Cancelled') {
        const [rows] = await pool.query('SELECT bike_id FROM rentals WHERE id = ?', [id]);
        if (rows.length > 0) {
          await pool.query('UPDATE bikes SET status = "Available" WHERE id = ?', [rows[0].bike_id]);
        }
      } else if (status === 'Active') {
        const [rows] = await pool.query('SELECT bike_id FROM rentals WHERE id = ?', [id]);
        if (rows.length > 0) {
          await pool.query('UPDATE bikes SET status = "Rented" WHERE id = ?', [rows[0].bike_id]);
        }
      }

      return { id: Number(id), ...rentalData };
    } else {
      const index = fallbackRentals.findIndex(r => r.id === Number(id));
      if (index !== -1) {
        fallbackRentals[index] = { ...fallbackRentals[index], ...rentalData };
        const bikeId = fallbackRentals[index].bike_id;
        const b = fallbackBikes.find(bike => bike.id === Number(bikeId));
        if (b) {
          if (status === 'Completed' || status === 'Cancelled') {
            b.status = 'Available';
          } else if (status === 'Active') {
            b.status = 'Rented';
          }
        }
        return fallbackRentals[index];
      }
      return null;
    }
  },

  async deleteRental(id) {
    if (isConnected) {
      const [rows] = await pool.query('SELECT bike_id FROM rentals WHERE id = ?', [id]);
      if (rows.length > 0) {
        await pool.query('UPDATE bikes SET status = "Available" WHERE id = ?', [rows[0].bike_id]);
      }
      const [res] = await pool.query('DELETE FROM rentals WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const target = fallbackRentals.find(r => r.id === Number(id));
      if (target) {
        const b = fallbackBikes.find(bike => bike.id === Number(target.bike_id));
        if (b) b.status = 'Available';
        fallbackRentals = fallbackRentals.filter(r => r.id !== Number(id));
        return true;
      }
      return false;
    }
  },

  // SUMMARY STATS
  async getStats() {
    let bikesList = await this.getBikes();
    let rentalsList = await this.getRentals();
    const totalBikes = bikesList.length;
    const availableBikes = bikesList.filter(b => b.status === 'Available').length;
    const activeRentals = rentalsList.filter(r => r.status === 'Active').length;
    const totalRevenue = rentalsList.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

    return {
      totalBikes,
      availableBikes,
      activeRentals,
      totalRevenue,
      isDatabaseLive: isConnected
    };
  }
};

module.exports = db;

