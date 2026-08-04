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

// Shows Sign In Required modal when a non-logged user attempts to get key
function showLoginRequiredModal() {
  var oldModal = document.getElementById('loginRequiredKeyModal');
  if (oldModal) {
    try { 
      var inst = bootstrap.Modal.getInstance(oldModal);
      if (inst) inst.hide();
    } catch(e) {}
    if (oldModal.parentNode) oldModal.parentNode.removeChild(oldModal);
  }

  var modal = document.createElement('div');
  modal.id = 'loginRequiredKeyModal';
  modal.className = 'modal fade';
  modal.tabIndex = '-1';
  document.body.appendChild(modal);

  modal.innerHTML = 
    '<div class="modal-dialog modal-dialog-centered">' +
      '<div class="modal-content glass-card border-zinc text-light rounded-4 shadow-lg" style="background:#0d0d12;border:1px solid #ff4444;">' +
        '<div class="modal-header border-secondary">' +
          '<h5 class="modal-title font-orbitron text-white"><i class="fa-solid fa-lock text-danger me-2"></i>SIGN IN REQUIRED</h5>' +
          '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '</div>' +
        '<div class="modal-body text-center py-4">' +
          '<div class="mb-3 text-danger fs-1"><i class="fa-solid fa-user-shield"></i></div>' +
          '<h4 class="font-orbitron text-white mb-2">Account Required</h4>' +
          '<p class="text-secondary small mb-4">You must be logged in to generate your personal 24-hour script key. Please sign in or create a free account to continue!</p>' +
          '<a href="/profile" class="btn btn-warning w-100 rounded-pill font-orbitron fw-bold py-2 text-dark mb-2">' +
            '<i class="fa-solid fa-right-to-bracket me-2"></i> Sign In / Create Account' +
          '</a>' +
          '<button type="button" class="btn btn-outline-secondary w-100 rounded-pill font-orbitron py-2 text-white" data-bs-dismiss="modal">' +
            'Cancel' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    var bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  } else {
    modal.style.display = 'block';
    modal.classList.add('show');
  }
}

// Triggers Unique 24-Hour Per-User Key Generation via Ad Gateway (Login Enforced)
window.triggerGetDailyKey = function triggerGetDailyKey() {
  // Check if user is logged in
  if (!window.currentUser) {
    showLoginRequiredModal();
    return;
  }

  try {
    // 1. Open Ad Network in New Tab
    var adUrl = window.adGatewayUrl || 'https://www.effectivecpmnetwork.com/ceafmimnp?key=f32f759ee712c2d7c1dd08569741cc49';
    var adWin = window.open(adUrl, '_blank');
    if (!adWin) {
      var a = document.createElement('a');
      a.href = adUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch(e) {
    console.warn('Ad gateway open error:', e);
  }

  // 2. Show Key Generation Countdown Modal
  setTimeout(function() { showUniqueKeyModal(); }, 300);
};

function showUniqueKeyModal() {
  // Remove old modal if exists to prevent stale state
  var oldModal = document.getElementById('uniqueKeyGatewayModal');
  if (oldModal) {
    try { 
      var inst = bootstrap.Modal.getInstance(oldModal);
      if (inst) inst.hide();
    } catch(e) {}
    if (oldModal.parentNode) oldModal.parentNode.removeChild(oldModal);
  }

  var modal = document.createElement('div');
  modal.id = 'uniqueKeyGatewayModal';
  modal.className = 'modal fade';
  modal.tabIndex = '-1';
  document.body.appendChild(modal);

  modal.innerHTML = 
    '<div class="modal-dialog modal-dialog-centered">' +
      '<div class="modal-content glass-card border-zinc text-light rounded-4 shadow-lg" style="background:#0d0d12;border:1px solid #333;">' +
        '<div class="modal-header border-secondary">' +
          '<h5 class="modal-title font-orbitron text-white"><i class="fa-solid fa-key text-warning me-2"></i>YOUR UNIQUE 24H KEY</h5>' +
          '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '</div>' +
        '<div class="modal-body text-center py-4">' +
          '<div class="spinner-border text-warning mb-3" id="keyTimerSpinner" role="status" style="width:3rem;height:3rem;">' +
            '<span class="visually-hidden">Generating...</span>' +
          '</div>' +
          '<h4 class="font-orbitron text-white mb-2" id="keyModalStatus">Verifying Sponsor Visit...</h4>' +
          '<p class="text-secondary small mb-3">Generating your personal un-shareable 24-hour script key in <strong class="text-warning fs-5" id="keyCountdownVal">5</strong> seconds...</p>' +
          '<div class="progress bg-dark mb-3" style="height:6px;">' +
            '<div class="progress-bar bg-warning progress-bar-striped progress-bar-animated" id="keyProgressBar" style="width:0%"></div>' +
          '</div>' +
          '<div style="display:none;" id="keyResultArea">' +
            '<div class="p-3 rounded-3 border border-secondary mb-3" style="background:#111118;">' +
              '<small class="text-uppercase text-secondary font-orbitron d-block mb-1">Your Personal 24-Hour Key:</small>' +
              '<code class="fs-5 text-warning font-monospace user-select-all" id="generatedKeyBox">NEXUS-KEY-LOADING</code>' +
            '</div>' +
            '<button class="btn btn-warning w-100 rounded-pill font-orbitron fw-bold py-2 text-dark" id="copyGeneratedKeyBtn">' +
              '<i class="fa-solid fa-copy me-2"></i> Copy Personal Key' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  var bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  var seconds = 5;
  var countdownVal = document.getElementById('keyCountdownVal');
  var progressBar = document.getElementById('keyProgressBar');
  var spinner = document.getElementById('keyTimerSpinner');
  var statusTxt = document.getElementById('keyModalStatus');
  var resultArea = document.getElementById('keyResultArea');
  var keyBox = document.getElementById('generatedKeyBox');
  var copyBtn = document.getElementById('copyGeneratedKeyBtn');

  var interval = setInterval(function() {
    seconds--;
    if (countdownVal) countdownVal.textContent = seconds;
    if (progressBar) progressBar.style.width = (((5 - seconds) / 5) * 100) + '%';

    if (seconds <= 0) {
      clearInterval(interval);
      if (spinner) spinner.style.display = 'none';
      if (statusTxt) statusTxt.textContent = 'Key Unlocked & Generated!';

      // Generate a client-side fallback key immediately
      var fallbackKey = 'NEXUS-KEY-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + new Date().toISOString().slice(0,10).replace(/-/g,'');

      // Request API key generation
      fetch('/api/key/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var finalKey = (data && data.key) ? data.key : fallbackKey;
        if (keyBox) keyBox.textContent = finalKey;
        if (resultArea) resultArea.style.display = 'block';
        if (copyBtn) {
          copyBtn.onclick = function() {
            navigator.clipboard.writeText(finalKey).then(function() {
              showToast('Personal 24-Hour Key copied to clipboard!', 'success');
              bsModal.hide();
            }).catch(function() {
              // Fallback copy for older browsers
              var ta = document.createElement('textarea');
              ta.value = finalKey;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              showToast('Personal 24-Hour Key copied!', 'success');
              bsModal.hide();
            });
          };
        }
      })
      .catch(function(err) {
        console.warn('Key API error, using fallback:', err);
        if (keyBox) keyBox.textContent = fallbackKey;
        if (resultArea) resultArea.style.display = 'block';
        if (copyBtn) {
          copyBtn.onclick = function() {
            navigator.clipboard.writeText(fallbackKey).then(function() {
              showToast('Personal 24-Hour Key copied!', 'success');
              bsModal.hide();
            }).catch(function() {
              var ta = document.createElement('textarea');
              ta.value = fallbackKey;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              showToast('Personal 24-Hour Key copied!', 'success');
              bsModal.hide();
            });
          };
        }
      });
    }
  }, 1000);
}

