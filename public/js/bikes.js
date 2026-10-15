/**
 * Bikes Fleet Management CRUD Logic (bikes.html)
 */

let currentBikes = [];

document.addEventListener('DOMContentLoaded', () => {
  initUrlFilters();
  loadBikes();
  setupFilterListeners();
  setupModalHandlers();
});

// Parse query params passed from index.html search
function initUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get('search');
  const location = urlParams.get('location');
  const category = urlParams.get('category');

  if (search) document.getElementById('filter-search').value = search;
  if (location) document.getElementById('filter-location').value = location;
  if (category) document.getElementById('filter-category').value = category;
}

// Clean helper for image paths
function formatImgPath(path) {
  if (!path) return 'images/hero_ladakh.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/images/')) return path.substring(1);
  return path;
}

// READ: Fetch and render bikes (Cards & Table)
async function loadBikes() {
  const container = document.getElementById('bikes-container');
  const tableBody = document.getElementById('bikes-table-body');
  const countEl = document.getElementById('bikes-count');
  
  const search = document.getElementById('filter-search').value.trim();
  const location = document.getElementById('filter-location').value;
  const category = document.getElementById('filter-category').value;

  try {
    const res = await API.getBikes(category, location, search);
    if (!res.success) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">${res.error || 'Failed to load bikes'}</p>`;
      if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--accent-red);">${res.error || 'Failed to load'}</td></tr>`;
      return;
    }

    currentBikes = res.data;
    if (countEl) countEl.textContent = currentBikes.length;

    if (currentBikes.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛵</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No bikes match your filters</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Try resetting your filters or add a new bike to this hub.</p>
          <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-secondary);">No bikes found</td></tr>`;
      }
      return;
    }

    // Render Cards
    container.innerHTML = currentBikes.map(bike => renderAdminBikeCard(bike)).join('');

    // Render Table
    if (tableBody) {
      tableBody.innerHTML = currentBikes.map(bike => renderBikeTableRow(bike)).join('');
    }
  } catch (err) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent-red); padding: 2rem;">Backend connection error. Make sure your server is running (node server.js).</p>`;
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--accent-red);">Unable to connect to Node.js / MySQL backend.</td></tr>`;
    }
  }
}

// Render Bike Card with clear Update and Delete buttons
function renderAdminBikeCard(bike) {
  const statusClass = 
    bike.status === 'Available' ? 'status-available' :
    bike.status === 'Rented' ? 'status-rented' : 'status-maintenance';

  const isAvailable = bike.status === 'Available';
  const imgUrl = formatImgPath(bike.image_url);

  return `
    <article class="bike-card" id="bike-card-${bike.id}">
      <div class="bike-card-img-wrap">
        <img src="${imgUrl}" alt="${bike.name}" loading="lazy" onerror="this.src='images/hero_ladakh.jpg'">
        <span class="bike-badge-category">${bike.category}</span>
        <span class="bike-badge-status ${statusClass}">${bike.status}</span>
      </div>
      <div class="bike-card-body">
        <div class="bike-brand">${bike.brand} • <span style="color:var(--text-muted)">ID: #${bike.id}</span></div>
        <h3 class="bike-title">${bike.name}</h3>
        <div class="bike-specs">
          <span class="bike-spec-item">⚙️ ${bike.engine_cc}</span>
          <span class="bike-spec-item">⛽ ${bike.fuel_type || 'Petrol'}</span>
        </div>
        <div class="bike-location">
          <span>📍 ${bike.location}</span>
        </div>
        <div class="bike-card-footer">
          <div class="bike-price">
            <span class="price-val">₹${Number(bike.price_per_day).toLocaleString('en-IN')} <span>/day</span></span>
          </div>
          <div class="bike-card-actions">
            ${isAvailable ? `
              <a href="bookings.html?bike_id=${bike.id}" class="btn btn-primary btn-sm" title="Rent this bike">⚡ Rent</a>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="openEditBikeModal(${bike.id})" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.5);" title="UPDATE Bike Details">
              ✏️ Update
            </button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteBike(${bike.id}, '${bike.name.replace(/'/g, "\\'")}')" title="DELETE Bike from Database">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Render Table Row with explicit CRUD buttons
function renderBikeTableRow(bike) {
  const statusBadge = 
    bike.status === 'Available' ? '<span class="bike-badge-status status-available">Available</span>' :
    bike.status === 'Rented' ? '<span class="bike-badge-status status-rented">Rented</span>' :
    '<span class="bike-badge-status status-maintenance">Maintenance</span>';

  return `
    <tr>
      <td><strong>#${bike.id}</strong></td>
      <td>
        <div style="font-weight: 700; color: #fff;">${bike.name}</div>
        <div style="font-size: 0.8rem; color: var(--primary-saffron);">${bike.brand}</div>
      </td>
      <td>
        <div>${bike.category}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${bike.engine_cc} • ${bike.fuel_type || 'Petrol'}</div>
      </td>
      <td>
        <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">₹${Number(bike.price_per_day).toLocaleString('en-IN')}</div>
      </td>
      <td>
        <div style="font-size: 0.9rem;">📍 ${bike.location}</div>
      </td>
      <td>${statusBadge}</td>
      <td style="text-align: right;">
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="openEditBikeModal(${bike.id})" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.5);">
            ✏️ Update
          </button>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteBike(${bike.id}, '${bike.name.replace(/'/g, "\\'")}')">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  `;
}

// FILTER HANDLERS
function setupFilterListeners() {
  document.getElementById('filter-search').addEventListener('input', debounce(loadBikes, 300));
  document.getElementById('filter-location').addEventListener('change', loadBikes);
  document.getElementById('filter-category').addEventListener('change', loadBikes);
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
}

function resetFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-location').value = 'All';
  document.getElementById('filter-category').value = 'All';
  loadBikes();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// MODAL HANDLERS FOR CREATE & UPDATE
function setupModalHandlers() {
  const modal = document.getElementById('bike-modal');
  const btnOpen = document.getElementById('btn-open-add-modal');
  const btnAddQuick = document.getElementById('btn-add-bike-quick');
  const btnClose = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel-modal');
  const form = document.getElementById('bike-form');

  const openAddModal = () => {
    document.getElementById('modal-heading').textContent = 'Add New Bike to Fleet (Create)';
    document.getElementById('btn-submit-modal').textContent = 'Save New Bike to Database';
    form.reset();
    document.getElementById('bike-id').value = '';
    document.getElementById('bike-status').value = 'Available';
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (btnOpen) btnOpen.addEventListener('click', openAddModal);
  if (btnAddQuick) btnAddQuick.addEventListener('click', openAddModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Close when clicking outside card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submit (CREATE or UPDATE)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bikeId = document.getElementById('bike-id').value;
    const bikeData = {
      name: document.getElementById('bike-name').value.trim(),
      brand: document.getElementById('bike-brand').value.trim(),
      category: document.getElementById('bike-category').value,
      engine_cc: document.getElementById('bike-engine').value.trim(),
      price_per_day: parseFloat(document.getElementById('bike-price').value),
      fuel_type: document.getElementById('bike-fuel').value,
      location: document.getElementById('bike-location').value.trim(),
      status: document.getElementById('bike-status').value,
      image_url: document.getElementById('bike-image').value.trim() || 'images/hero_ladakh.jpg'
    };

    try {
      if (bikeId) {
        // UPDATE (PUT)
        const res = await API.updateBike(bikeId, bikeData);
        if (res.success) {
          showToast(`Bike "${bikeData.name}" updated successfully in MySQL!`, 'success');
          closeModal();
          loadBikes();
        } else {
          showToast(res.error || 'Failed to update bike', 'error');
        }
      } else {
        // CREATE (POST)
        const res = await API.createBike(bikeData);
        if (res.success) {
          showToast(`New bike "${bikeData.name}" added to MySQL database!`, 'success');
          closeModal();
          loadBikes();
        } else {
          showToast(res.error || 'Failed to add bike', 'error');
        }
      }
    } catch (err) {
      showToast('Server error while saving bike', 'error');
    }
  });
}

// UPDATE: Open Edit Modal with Bike Info
window.openEditBikeModal = function(id) {
  const bike = currentBikes.find(b => b.id === Number(id));
  if (!bike) return;

  document.getElementById('modal-heading').textContent = `Update Bike: ${bike.name} (ID #${bike.id})`;
  document.getElementById('btn-submit-modal').textContent = 'Save Changes (Update)';

  document.getElementById('bike-id').value = bike.id;
  document.getElementById('bike-name').value = bike.name;
  document.getElementById('bike-brand').value = bike.brand;
  document.getElementById('bike-category').value = bike.category;
  document.getElementById('bike-engine').value = bike.engine_cc;
  document.getElementById('bike-price').value = bike.price_per_day;
  document.getElementById('bike-fuel').value = bike.fuel_type || 'Petrol';
  document.getElementById('bike-location').value = bike.location;
  document.getElementById('bike-status').value = bike.status;
  document.getElementById('bike-image').value = bike.image_url || '';

  document.getElementById('bike-modal').classList.add('active');
};

// DELETE: Delete Bike from database
window.handleDeleteBike = async function(id, name) {
  if (!confirm(`Are you sure you want to DELETE "${name}" (ID #${id}) from the MySQL database? This action cannot be undone.`)) {
    return;
  }

  try {
    const res = await API.deleteBike(id);
    if (res.success) {
      showToast(`Bike "${name}" was deleted successfully from MySQL.`, 'success');
      loadBikes();
    } else {
      showToast(res.error || 'Failed to delete bike', 'error');
    }
  } catch (err) {
    showToast('Server error while deleting bike', 'error');
  }
};
