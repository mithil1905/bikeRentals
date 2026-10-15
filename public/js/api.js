/**
 * Centralized API Client & UI Helpers for Bharat Bike Rental System
 * Auto-detects port 3000 vs VS Code Live Server (port 5500)
 */

// If opened in VS Code Live Server (port 5500), route API calls to Node.js backend at localhost:3000
const API_BASE = (window.location.port === '3000') 
  ? '' 
  : 'http://localhost:3000';

const API = {
  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    return await res.json();
  },

  // Bikes CRUD
  async getBikes(category = '', location = '', search = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/api/bikes?${params.toString()}`);
    return await res.json();
  },

  async getBikeById(id) {
    const res = await fetch(`${API_BASE}/api/bikes/${id}`);
    return await res.json();
  },

  // CREATE Bike
  async createBike(bikeData) {
    const res = await fetch(`${API_BASE}/api/bikes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bikeData)
    });
    return await res.json();
  },

  // UPDATE Bike
  async updateBike(id, bikeData) {
    const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bikeData)
    });
    return await res.json();
  },

  // DELETE Bike
  async deleteBike(id) {
    const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Rentals CRUD
  async getRentals() {
    const res = await fetch(`${API_BASE}/api/rentals`);
    return await res.json();
  },

  // CREATE Rental Booking
  async createRental(rentalData) {
    const res = await fetch(`${API_BASE}/api/rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentalData)
    });
    return await res.json();
  },

  // UPDATE Rental Booking
  async updateRental(id, rentalData) {
    const res = await fetch(`${API_BASE}/api/rentals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentalData)
    });
    return await res.json();
  },

  // DELETE Rental Booking
  async deleteRental(id) {
    const res = await fetch(`${API_BASE}/api/rentals/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : '⚠️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Check database indicator
async function updateDbStatusPill() {
  const pill = document.getElementById('db-status-pill');
  if (!pill) return;
  try {
    const data = await API.getStats();
    if (data.success) {
      if (data.data.isDatabaseLive) {
        pill.innerHTML = '<span class="dot"></span> MySQL Connected';
        pill.style.background = 'rgba(16, 185, 129, 0.15)';
        pill.style.color = '#10b981';
      } else {
        pill.innerHTML = '<span class="dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b"></span> Fallback Active';
        pill.style.background = 'rgba(245, 158, 11, 0.15)';
        pill.style.color = '#f59e0b';
      }
    }
  } catch (err) {
    pill.innerHTML = '<span class="dot" style="background:#ef4444; box-shadow:0 0 8px #ef4444"></span> Backend Offline (Run: node server.js)';
    pill.style.background = 'rgba(239, 68, 68, 0.15)';
    pill.style.color = '#ef4444';
  }
}

document.addEventListener('DOMContentLoaded', updateDbStatusPill);
