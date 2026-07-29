/**
 * Roblox Script Nexus - Main Client JS
 */

document.addEventListener('DOMContentLoaded', () => {
  updateLoadoutBadge();
  initCopyAdGateway();
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

// Copy Script Button with Ad Network Trigger & 5s Countdown Modal
function initCopyAdGateway() {
  document.querySelectorAll('.copy-script-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const scriptId = btn.getAttribute('data-script-id');
      const scriptTitle = btn.getAttribute('data-script-title') || 'Roblox Script';
      const scriptCode = btn.getAttribute('data-script-code');

      if (!scriptCode) return;

      // 1. Open Ad Network in New Tab
      const adUrl = window.adGatewayUrl || 'https://www.google.com';
      window.open(adUrl, '_blank');

      // 2. Show Unlock Modal with Countdown
      showAdCopyModal(scriptTitle, scriptCode);
    });
  });

  // Block right click / manual selection on protected blocks
  document.querySelectorAll('.protected-code-block').forEach(el => {
    el.addEventListener('copy', e => e.preventDefault());
    el.addEventListener('cut', e => e.preventDefault());
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
}

function showAdCopyModal(title, code) {
  let modal = document.getElementById('adCopyGatewayModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adCopyGatewayModal';
    modal.className = 'modal fade';
    modal.tabIndex = '-1';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content glass-card border-zinc text-light rounded-4 shadow-lg">
        <div class="modal-header border-secondary">
          <h5 class="modal-title font-orbitron text-white"><i class="fa-solid fa-lock-open text-emerald me-2"></i>UNLOCKING SCRIPT</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center py-4">
          <div class="spinner-border text-emerald mb-3" id="adTimerSpinner" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4 class="font-orbitron text-white mb-2" id="adTimerTitle">${title}</h4>
          <p class="text-zinc-muted small mb-3">Supporting sponsor unlocked! Preparing your script loadstring in <strong class="text-emerald fs-5" id="adCountdownVal">5</strong> seconds...</p>
          <div class="progress bg-dark mb-3" style="height: 6px;">
            <div class="progress-bar bg-emerald progress-bar-striped progress-bar-animated" id="adProgressBar" style="width: 0%"></div>
          </div>
          <button class="btn btn-zinc-white w-100 rounded-pill font-orbitron py-2 d-none" id="adFinalCopyBtn">
            <i class="fa-solid fa-check-double text-emerald me-2"></i> Click to Copy Code
          </button>
        </div>
      </div>
    </div>
  `;

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  let seconds = 5;
  const countdownVal = document.getElementById('adCountdownVal');
  const progressBar = document.getElementById('adProgressBar');
  const finalBtn = document.getElementById('adFinalCopyBtn');
  const spinner = document.getElementById('adTimerSpinner');

  const interval = setInterval(() => {
    seconds--;
    if (countdownVal) countdownVal.textContent = seconds;
    if (progressBar) progressBar.style.width = `${((5 - seconds) / 5) * 100}%`;

    if (seconds <= 0) {
      clearInterval(interval);
      if (spinner) spinner.classList.add('d-none');
      if (finalBtn) {
        finalBtn.classList.remove('d-none');
        finalBtn.onclick = () => {
          navigator.clipboard.writeText(code).then(() => {
            showToast('Script copied to clipboard successfully!', 'success');
            bsModal.hide();
          });
        };
      }
    }
  }, 1000);
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
