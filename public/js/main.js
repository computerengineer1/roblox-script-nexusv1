/**
 * Roblox Script Nexus - Main Client JS
 */

document.addEventListener('DOMContentLoaded', () => {
  updateLoadoutBadge();
});

// Updates the navigation badge with saved scripts count from LocalStorage
function updateLoadoutBadge() {
  const badge = document.getElementById('loadoutBadge');
  if (!badge) return;
  
  try {
    const loadout = JSON.parse(localStorage.getItem('nexus_loadout') || '[]');
    if (loadout.length > 0) {
      badge.textContent = loadout.length;
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  } catch (err) {
    console.error('Error reading loadout count:', err);
  }
}

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0 shadow-cyan show`;
  toastEl.role = 'alert';
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body font-orbitron small">
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    toastEl.remove();
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '1100';
  document.body.appendChild(container);
  return container;
}
