-- ==========================================================
-- BHARAT BIKE RENTAL SYSTEM (यात्री व्हील्स - YatriWheels)
-- MySQL Database Schema & Initial Seed Data
-- ==========================================================

-- 1. Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS bike_rental_db;
USE bike_rental_db;

-- 2. Drop existing tables if re-running script (rentals first due to foreign key)
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS bikes;

-- 3. Create the 'bikes' table
CREATE TABLE bikes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Cruiser, Scooty, Commuter, Adventure, Electric, Sport
    engine_cc VARCHAR(30) NOT NULL, -- e.g., 349 cc, 110 cc, 3.7 kWh
    price_per_day DECIMAL(10, 2) NOT NULL, -- Price in Indian Rupees (₹)
    fuel_type VARCHAR(30) DEFAULT 'Petrol',
    location VARCHAR(100) NOT NULL, -- Indian Hub City
    image_url TEXT,
    status ENUM('Available', 'Rented', 'Maintenance') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create the 'rentals' table for booking records
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL, -- 10-digit Indian mobile
    customer_aadhaar VARCHAR(20) NOT NULL, -- Aadhaar (12 digits) or Driving License
    bike_id INT NOT NULL,
    start_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL, -- Total in ₹ including GST
    pickup_location VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bike FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

-- 5. Insert Realistic Indian Seed Bikes
INSERT INTO bikes (name, brand, category, engine_cc, price_per_day, fuel_type, location, image_url, status) VALUES
('Royal Enfield Classic 350', 'Royal Enfield', 'Cruiser', '349 cc', 1299.00, 'Petrol', 'Goa - Calangute Hub', '/images/hero_ladakh.jpg', 'Available'),
('Royal Enfield Himalayan 450', 'Royal Enfield', 'Adventure', '452 cc', 1599.00, 'Petrol', 'Manali - Mall Road Hub', '/images/rider_booking.jpg', 'Available'),
('Honda Activa 6G', 'Honda', 'Scooty', '109 cc', 399.00, 'Petrol', 'Bengaluru - Koramangala Hub', '/images/goa_beach.jpg', 'Available'),
('Bajaj Pulsar NS200', 'Bajaj', 'Sport', '199.5 cc', 699.00, 'Petrol', 'Mumbai - Bandra Hub', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80', 'Available'),
('Ather 450X Gen 3', 'Ather Energy', 'Electric', '3.7 kWh Battery', 499.00, 'Electric', 'Bengaluru - Indiranagar Hub', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80', 'Available'),
('KTM 250 Duke', 'KTM', 'Sport', '248.8 cc', 1099.00, 'Petrol', 'Delhi - Connaught Place Hub', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80', 'Available'),
('TVS Jupiter 125', 'TVS', 'Scooty', '124.8 cc', 420.00, 'Petrol', 'Jaipur - MI Road Hub', '/images/goa_beach.jpg', 'Available'),
('Yamaha YZF R15 V4', 'Yamaha', 'Sport', '155 cc', 899.00, 'Petrol', 'Goa - Anjuna Hub', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80', 'Available');

-- 6. Insert Sample Indian Rental Bookings
INSERT INTO rentals (customer_name, customer_phone, customer_aadhaar, bike_id, start_date, days, total_amount, pickup_location, status) VALUES
('Aarav Sharma', '9876543210', '4589 1234 5678', 1, CURDATE(), 3, 3897.00, 'Goa - Calangute Hub', 'Active'),
('Priya Nair', '9845123456', '8976 5432 1098', 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 2, 798.00, 'Bengaluru - Koramangala Hub', 'Completed'),
('Rohan Verma', '9123456780', 'DL-0420220019283', 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 5, 7995.00, 'Manali - Mall Road Hub', 'Active');

-- Mark bike #1 as Rented since Aarav has an Active booking
UPDATE bikes SET status = 'Rented' WHERE id = 1;

-- Verification queries
SELECT * FROM bikes;
SELECT * FROM rentals;
