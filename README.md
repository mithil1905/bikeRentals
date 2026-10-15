# 🏍️ YatriWheels (यात्री व्हील्स) - Bharat Bike Rental System

A full-stack Indian-themed Bike Rental Management System built with **HTML5, Vanilla CSS, JavaScript (ES6+), Node.js/Express, and MySQL Workbench**.

---

## 🌟 Key Features

1. **Rooted in Indian Riding Culture:**
   - **Iconic Indian Fleet:** Royal Enfield Classic 350 ("Bullet"), Royal Enfield Himalayan 450, Honda Activa 6G, Bajaj Pulsar NS200, Ather 450X EV, KTM Duke 250, TVS Jupiter.
   - **Key Indian Hubs:** Goa (Calangute), Bengaluru (Koramangala/Indiranagar), Manali (Mall Road), Mumbai (Bandra West), Delhi NCR (Connaught Place), Jaipur (MI Road).
   - **Indian Context:** Aadhaar Card (12-digit) / Indian Driving License verification, 18% GST tax calculation, ₹100 Indian Festive Discount, 2 Free ISI Helmets.

2. **At Least One Real Image on Every Page:**
   - `index.html`: Royal Enfield Classic 350 cruising through Ladakh mountain passes with prayer flags.
   - `bikes.html`: Honda Activa & Bajaj Pulsar parked on a sunny Goa beach shack trail.
   - `bookings.html`: Confident Indian rider holding an ISI-approved helmet with Himalayan motorcycle.
   - `about.html`: Riders touring the winding mountain highways through Munnar tea gardens.

3. **Complete CRUD Operations (Fleet & Bookings):**
   - **CREATE:** Add new bike to fleet with custom specs & Book a new rental ride.
   - **READ:** Search, filter by category/city, view live fleet & active booking records.
   - **UPDATE:** Edit bike details/pricing/status & Return bikes / update booking duration.
   - **DELETE:** Remove bike from fleet & Cancel/delete rental bookings.

---

## 🛠️ Step-by-Step MySQL Workbench Setup

### Step 1: Open MySQL Workbench
- Launch **MySQL Workbench 8.0** on your Windows computer.
- Click on your local instance connection (e.g., `Local instance MySQL80` or `localhost:3306`).
- Enter your MySQL password when prompted.

### Step 2: Open SQL Query Editor
- In the top menu, click **File > Open SQL Script...** (or press `Ctrl + Shift + O`).
- Navigate to:
  `C:\Users\Deekshitha\.gemini\antigravity-ide\scratch\bike-rental-system\database\schema.sql`
- Or simply open a new query tab (`Ctrl + T`) and copy-paste the contents of `database/schema.sql`.

### Step 3: Execute the Script
- Click the **Yellow Lightning Bolt icon (⚡)** in the toolbar to execute the entire script.
- In the bottom output pane, you will see green checkmarks confirming:
  - `CREATE DATABASE bike_rental_db`
  - `CREATE TABLE bikes`
  - `CREATE TABLE rentals`
  - 8 Indian bikes and sample bookings inserted.

### Step 4: Configure Your `.env` File
Open `C:\Users\Deekshitha\.gemini\antigravity-ide\scratch\bike-rental-system\.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=bike_rental_db
DB_PORT=3306
```
*(Replace `YOUR_MYSQL_ROOT_PASSWORD` with the password you use to log into MySQL Workbench).*

---

## 🚀 Running the Project

1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   cd "C:\Users\Deekshitha\.gemini\antigravity-ide\scratch\bike-rental-system"
   node server.js
   ```

2. Open your web browser and go to:
   👉 **http://localhost:3000**
