/**
 * Home Page (index.html) Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  loadLiveStats();
  loadFeaturedBikes();
  setupQuickSearch();
});

async function loadLiveStats() {
  try {
    const res = await API.getStats();
    if (res.success) {
      const stats = res.data;
      const bikesEl = document.getElementById('stat-total-bikes');
      const rentalsEl = document.getElementById('stat-active-rentals');
      if (bikesEl) bikesEl.textContent = `${stats.totalBikes}+`;
      if (rentalsEl) rentalsEl.textContent = `${stats.activeRentals + 18}+`;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadFeaturedBikes() {
  const container = document.getElementById('featured-bikes-grid');
  if (!container) return;

  try {
    const res = await API.getBikes();
    if (!res.success || !res.data.length) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No bikes found in fleet.</p>`;
      return;
    }

    // Display first 6 bikes
    const featured = res.data.slice(0, 6);
    container.innerHTML = featured.map(bike => renderBikeCardHtml(bike)).join('');
  } catch (err) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent-red);">Failed to connect to bike service.</p>`;
  }
}

function renderBikeCardHtml(bike) {
  const statusClass = 
    bike.status === 'Available' ? 'status-available' :
    bike.status === 'Rented' ? 'status-rented' : 'status-maintenance';

  const isAvailable = bike.status === 'Available';

  return `
    <article class="bike-card">
      <div class="bike-card-img-wrap">
        <img src="${bike.image_url || '/images/hero_ladakh.jpg'}" alt="${bike.name}" loading="lazy" onerror="this.src='/images/hero_ladakh.jpg'">
        <span class="bike-badge-category">${bike.category}</span>
        <span class="bike-badge-status ${statusClass}">${bike.status}</span>
      </div>
      <div class="bike-card-body">
        <div class="bike-brand">${bike.brand}</div>
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
              <a href="bookings.html?bike_id=${bike.id}" class="btn btn-primary btn-sm">Rent Now</a>
            ` : `
              <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.6; cursor: not-allowed;">Booked</button>
            `}
          </div>
        </div>
      </div>
    </article>
  `;
}

function setupQuickSearch() {
  const btn = document.getElementById('btn-quick-search');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const searchVal = document.getElementById('quick-search').value.trim();
    const locVal = document.getElementById('quick-location').value;
    const catVal = document.getElementById('quick-category').value;

    const params = new URLSearchParams();
    if (searchVal) params.append('search', searchVal);
    if (locVal && locVal !== 'All') params.append('location', locVal);
    if (catVal && catVal !== 'All') params.append('category', catVal);

    window.location.href = `bikes.html?${params.toString()}`;
  });
}
