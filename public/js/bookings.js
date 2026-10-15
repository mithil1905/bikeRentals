/**
 * Rental Bookings CRUD Logic (bookings.html)
 */

let availableBikes = [];
let currentRentals = [];

document.addEventListener('DOMContentLoaded', async () => {
  initDefaultDate();
  await loadBikesDropdown();
  await loadRentals();
  setupPricingCalculation();
  setupBookingForm();
  setupEditModal();
});

// Set default start date to today
function initDefaultDate() {
  const dateInput = document.getElementById('cust-start-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }
}

// Load bikes into the select dropdown
async function loadBikesDropdown() {
  const select = document.getElementById('cust-bike-select');
  if (!select) return;

  try {
    const res = await API.getBikes();
    if (!res.success) {
      select.innerHTML = '<option value="">Failed to load bikes</option>';
      return;
    }

    availableBikes = res.data;
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedId = urlParams.get('bike_id');

    select.innerHTML = `
      <option value="">-- Choose an Indian Bike / Scooter --</option>
      ${availableBikes.map(b => `
        <option value="${b.id}" data-price="${b.price_per_day}" data-location="${b.location}" ${preselectedId && Number(preselectedId) === b.id ? 'selected' : ''} ${b.status !== 'Available' ? 'disabled' : ''}>
          ${b.name} (${b.category} • ${b.engine_cc}) - ₹${b.price_per_day}/day ${b.status !== 'Available' ? ' [Currently Rented]' : ''}
        </option>
      `).join('')}
    `;

    // Auto set location if bike selected
    if (preselectedId) {
      const match = availableBikes.find(b => b.id === Number(preselectedId));
      if (match && match.location) {
        const hubSelect = document.getElementById('cust-hub');
        for (let opt of hubSelect.options) {
          if (match.location.toLowerCase().includes(opt.value.split(' - ')[0].toLowerCase())) {
            hubSelect.value = opt.value;
            break;
          }
        }
      }
    }

    calculateTotal();
  } catch (err) {
    select.innerHTML = '<option value="">Error connecting to server</option>';
  }
}

// Live calculation of rent + 18% GST - Festive discount in INR
function setupPricingCalculation() {
  const select = document.getElementById('cust-bike-select');
  const daysInput = document.getElementById('cust-days');

  if (select) select.addEventListener('change', () => {
    // Sync location if available
    const selectedOption = select.options[select.selectedIndex];
    const loc = selectedOption.getAttribute('data-location');
    if (loc) {
      const hubSelect = document.getElementById('cust-hub');
      for (let opt of hubSelect.options) {
        if (loc.toLowerCase().includes(opt.value.split(' - ')[0].toLowerCase())) {
          hubSelect.value = opt.value;
          break;
        }
      }
    }
    calculateTotal();
  });

  if (daysInput) daysInput.addEventListener('input', calculateTotal);
}

function calculateTotal() {
  const select = document.getElementById('cust-bike-select');
  const daysInput = document.getElementById('cust-days');
  const baseEl = document.getElementById('calc-base');
  const gstEl = document.getElementById('calc-gst');
  const totalEl = document.getElementById('calc-total');

  if (!select || !daysInput || !totalEl) return;

  const selectedOption = select.options[select.selectedIndex];
  const price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price') || 0) : 0;
  const days = parseInt(daysInput.value) || 1;

  if (price > 0 && days > 0) {
    const baseAmount = price * days;
    const gst = Math.round(baseAmount * 0.18);
    const discount = 100; // Special Indian Festive Discount
    const grandTotal = Math.max(0, baseAmount + gst - discount);

    baseEl.textContent = `₹${baseAmount.toLocaleString('en-IN')}`;
    gstEl.textContent = `₹${gst.toLocaleString('en-IN')}`;
    totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    return grandTotal;
  } else {
    baseEl.textContent = '₹0';
    gstEl.textContent = '₹0';
    totalEl.textContent = '₹0';
    return 0;
  }
}

// CREATE: Handle Booking Submission
function setupBookingForm() {
  const form = document.getElementById('new-booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bikeSelect = document.getElementById('cust-bike-select');
    const bikeId = bikeSelect.value;
    if (!bikeId) {
      showToast('Please select a bike to rent', 'error');
      return;
    }

    const calculatedTotal = calculateTotal();
    const rentalData = {
      customer_name: document.getElementById('cust-name').value.trim(),
      customer_phone: document.getElementById('cust-phone').value.trim(),
      customer_aadhaar: document.getElementById('cust-aadhaar').value.trim(),
      bike_id: parseInt(bikeId),
      start_date: document.getElementById('cust-start-date').value,
      days: parseInt(document.getElementById('cust-days').value),
      total_amount: calculatedTotal,
      pickup_location: document.getElementById('cust-hub').value
    };

    try {
      const res = await API.createRental(rentalData);
      if (res.success) {
        showToast('🎉 Booking Confirmed! Safe ride across Bharat.', 'success');
        form.reset();
        initDefaultDate();
        await loadBikesDropdown();
        await loadRentals();
      } else {
        showToast(res.error || 'Failed to complete booking', 'error');
      }
    } catch (err) {
      showToast('Server error while saving booking', 'error');
    }
  });
}

// READ: Fetch all rentals and render table
async function loadRentals() {
  const tbody = document.getElementById('rentals-table-body');
  if (!tbody) return;

  try {
    const res = await API.getRentals();
    if (!res.success) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--accent-red);">${res.error}</td></tr>`;
      return;
    }

    currentRentals = res.data;

    if (currentRentals.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            No bookings recorded yet. Use the reservation form above to create your first booking!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = currentRentals.map(rental => {
      const statusBadge = 
        rental.status === 'Active' ? '<span class="bike-badge-status status-available">Active Ride</span>' :
        rental.status === 'Completed' ? '<span class="bike-badge-status" style="background: rgba(59,130,246,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.4)">Returned</span>' :
        '<span class="bike-badge-status status-rented">Cancelled</span>';

      const formattedDate = new Date(rental.start_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <tr>
          <td>
            <strong>#YATRI-${rental.id}</strong><br>
            <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(rental.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </td>
          <td>
            <div style="font-weight: 700; color: #fff;">${rental.customer_name}</div>
            <div style="font-size: 0.85rem; color: var(--primary-saffron);">📞 +91 ${rental.customer_phone}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">🪪 ${rental.customer_aadhaar}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${rental.bike_name || `Bike #${rental.bike_id}`}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">📍 ${rental.pickup_location}</div>
          </td>
          <td>
            <div>From: <strong>${formattedDate}</strong></div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${rental.days} Day(s)</div>
          </td>
          <td>
            <div style="font-weight: 800; font-size: 1.15rem; color: #fff;">₹${Number(rental.total_amount).toLocaleString('en-IN')}</div>
            <div style="font-size: 0.75rem; color: var(--accent-green);">Incl. GST & Discount</div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end; flex-wrap: wrap;">
              ${rental.status === 'Active' ? `
                <button class="btn btn-primary btn-sm" onclick="markRentalCompleted(${rental.id})" title="Mark Return (Update Status)">
                  ✓ Return (Update)
                </button>
              ` : ''}
              <button class="btn btn-secondary btn-sm" onclick="openEditBookingModal(${rental.id})" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.5);" title="Edit Booking Record (Update)">
                ✏️ Edit (Update)
              </button>
              <button class="btn btn-danger btn-sm" onclick="cancelRentalBooking(${rental.id})" title="Cancel and Delete Record (Delete)">
                🗑️ Cancel (Delete)
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--accent-red);">Failed to load bookings</td></tr>`;
  }
}

// UPDATE: Quick Mark as Returned
window.markRentalCompleted = async function(id) {
  try {
    const res = await API.updateRental(id, { status: 'Completed' });
    if (res.success) {
      showToast(`Booking #YATRI-${id} marked as Completed. Bike is now Available!`, 'success');
      await loadRentals();
      await loadBikesDropdown();
    } else {
      showToast(res.error || 'Failed to update rental status', 'error');
    }
  } catch (err) {
    showToast('Server error while updating rental', 'error');
  }
};

// UPDATE: Open Edit Modal
window.openEditBookingModal = function(id) {
  const rental = currentRentals.find(r => r.id === Number(id));
  if (!rental) return;

  document.getElementById('edit-booking-id').value = rental.id;
  document.getElementById('edit-cust-name').value = rental.customer_name;
  document.getElementById('edit-days').value = rental.days;
  document.getElementById('edit-status').value = rental.status;
  document.getElementById('edit-amount').value = rental.total_amount;

  document.getElementById('edit-booking-modal').classList.add('active');
};

function setupEditModal() {
  const modal = document.getElementById('edit-booking-modal');
  const btnClose = document.getElementById('btn-close-edit-modal');
  const btnCancel = document.getElementById('btn-cancel-edit-modal');
  const form = document.getElementById('edit-booking-form');

  const closeModal = () => modal.classList.remove('active');

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-booking-id').value;
    const payload = {
      days: parseInt(document.getElementById('edit-days').value),
      status: document.getElementById('edit-status').value,
      total_amount: parseFloat(document.getElementById('edit-amount').value)
    };

    try {
      const res = await API.updateRental(id, payload);
      if (res.success) {
        showToast(`Booking #YATRI-${id} updated successfully!`, 'success');
        closeModal();
        await loadRentals();
        await loadBikesDropdown();
      } else {
        showToast(res.error || 'Failed to update booking', 'error');
      }
    } catch (err) {
      showToast('Error updating booking', 'error');
    }
  });
}

// DELETE: Cancel / Remove Rental Booking
window.cancelRentalBooking = async function(id) {
  if (!confirm(`Are you sure you want to cancel and delete Booking #YATRI-${id}? This will free the bike back to available fleet.`)) {
    return;
  }

  try {
    const res = await API.deleteRental(id);
    if (res.success) {
      showToast(`Booking #YATRI-${id} deleted. Bike returned to fleet.`, 'success');
      await loadRentals();
      await loadBikesDropdown();
    } else {
      showToast(res.error || 'Failed to cancel booking', 'error');
    }
  } catch (err) {
    showToast('Server error while deleting booking', 'error');
  }
};
