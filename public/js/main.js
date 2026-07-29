/**
 * Roblox Script Nexus - Main Client JS
 */

document.addEventListener('DOMContentLoaded', () => {
  updateLoadoutBadge();
  initCopyAdGateway();
  initAntiAdBlockDetector();
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

// Anti-AdBlock & Brave Shields Detection System
function initAntiAdBlockDetector() {
  // Create bait test element
  const bait = document.createElement('div');
  bait.className = 'adsbygoogle ad-unit ad-zone ad_slot adsbox pub_300x250';
  bait.style.cssText = 'position: absolute !important; top: -9999px !important; left: -9999px !important; width: 1px !important; height: 1px !important;';
  document.body.appendChild(bait);

  setTimeout(() => {
    const isBlocked = (
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      bait.offsetParent === null ||
      window.getComputedStyle(bait).display === 'none' ||
      window.getComputedStyle(bait).visibility === 'hidden'
    );

    bait.remove();

    if (isBlocked) {
      showAntiAdBlockModal();
    }
  }, 400);
}

function showAntiAdBlockModal() {
  if (document.getElementById('antiAdBlockModal')) return;

  const modal = document.createElement('div');
  modal.id = 'antiAdBlockModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9, 9, 11, 0.95); backdrop-filter: blur(12px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;';

  modal.innerHTML = `
    <div class="glass-card border-purple rounded-4 p-4 p-md-5 max-w-600 text-center shadow-lg animate-fade-in position-relative">
      <div class="bg-dark p-3 rounded-circle border border-secondary d-inline-block mb-3">
        <i class="fa-solid fa-shield-halved text-rose fs-1"></i>
      </div>
      <h3 class="font-orbitron text-white fw-bold mb-2">ADBLOCKER / BRAVE SHIELDS DETECTED</h3>
      <p class="text-zinc-muted small mb-4">
        We noticed you are using an AdBlocker or Brave Shields. Our Roblox scripts and loadouts are <strong>100% Free</strong> and supported by ad sponsors.
      </p>

      <div class="bg-dark-gradient p-3 rounded-3 text-start border border-secondary mb-4 small text-zinc-light">
        <h6 class="font-orbitron text-cyan mb-2"><i class="fa-solid fa-circle-info me-1"></i> How to disable and unlock scripts:</h6>
        <ol class="mb-0 ps-3 text-zinc-muted">
          <li class="mb-1">Click the <strong>AdBlocker / Lion Shield icon</strong> in your browser address bar.</li>
          <li class="mb-1">Select <strong>"Turn off Shields"</strong> or <strong>"Pause on this site"</strong>.</li>
          <li>Click the <strong>"I Have Disabled AdBlocker"</strong> button below to refresh.</li>
        </ol>
      </div>

      <button onclick="window.location.reload()" class="btn btn-emerald text-dark w-100 rounded-pill font-orbitron fw-bold py-3 shadow-cyan">
        <i class="fa-solid fa-rotate-right me-2"></i> I HAVE DISABLED ADBLOCKER (REFRESH)
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
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
      const adUrl = window.adGatewayUrl || 'https://www.effectivecpmnetwork.com/ceafmimnp?key=f32f759ee712c2d7c1dd08569741cc49';
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
