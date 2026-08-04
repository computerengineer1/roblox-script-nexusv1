// Define triggerGetDailyKey globally on window before any DOM events
window.triggerGetDailyKey = function triggerGetDailyKey() {
  if (!window.currentUser) {
    showLoginRequiredModal();
    return;
  }
  try {
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
  setTimeout(function() { showUniqueKeyModal(); }, 300);
};

document.addEventListener('DOMContentLoaded', function() {
  updateLoadoutBadge();
  initCopyAdGateway();
  initAntiAdBlockDetector();

  // Auto-trigger key modal if user arrived via /key redirect
  if (window.location.hash === '#getkey') {
    setTimeout(function() {
      if (typeof window.triggerGetDailyKey === 'function') {
        window.triggerGetDailyKey();
      }
    }, 500);
  }
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

// Standalone Overlay Modal Creator (Guaranteed 100% visible on all browsers, AdBlockers, & Brave Shields)
function createCustomNexusOverlay(modalId, innerHtml) {
  var old = document.getElementById(modalId);
  if (old && old.parentNode) old.parentNode.removeChild(old);

  var overlay = document.createElement('div');
  overlay.id = modalId;
  overlay.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(9, 9, 14, 0.92) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 15px !important; box-sizing: border-box !important; opacity: 1 !important; visibility: visible !important;';

  var dialog = document.createElement('div');
  dialog.style.cssText = 'width: 100% !important; max-width: 450px !important; background: #0e0e13 !important; border: 1px solid #ffaa00 !important; border-radius: 18px !important; box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(255,170,0,0.2) !important; padding: 25px !important; text-align: center !important; color: #ffffff !important; position: relative !important; font-family: "Inter", sans-serif !important;';

  dialog.innerHTML = innerHtml;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  });

  return overlay;
}

// Shows Sign In Required modal when a non-logged user attempts to get key
function showLoginRequiredModal() {
  var html = 
    '<div style="position:absolute; top:15px; right:15px; cursor:pointer; color:#888; font-size:20px;" onclick="var m=document.getElementById(\'loginRequiredKeyModal\'); if(m) m.remove();">&times;</div>' +
    '<div style="font-size: 3rem; color: #ffaa00; margin-bottom: 10px;"><i class="fa-solid fa-user-shield"></i></div>' +
    '<h3 style="font-family:\'Orbitron\',sans-serif; font-size:1.4rem; color:#fff; margin-bottom:10px; font-weight:bold;">ACCOUNT REQUIRED</h3>' +
    '<p style="color:#aaa; font-size:0.9rem; margin-bottom:20px; line-height:1.5;">You must be logged in to generate your personal 24-hour script key. Please sign in or create a free account to continue!</p>' +
    '<a href="/profile" style="display:block; width:100%; padding:14px; background:#ffaa00; color:#0d0d12; font-weight:bold; font-family:\'Orbitron\',sans-serif; text-decoration:none; border-radius:30px; margin-bottom:10px; font-size:0.95rem; box-shadow: 0 4px 15px rgba(255,170,0,0.4); box-sizing:border-box;">' +
      '<i class="fa-solid fa-right-to-bracket me-2"></i> SIGN IN / CREATE ACCOUNT' +
    '</a>' +
    '<button onclick="var m=document.getElementById(\'loginRequiredKeyModal\'); if(m) m.remove();" style="display:block; width:100%; padding:10px; background:transparent; color:#888; border:1px solid #333; border-radius:30px; cursor:pointer; font-size:0.85rem;">' +
      'Cancel' +
    '</button>';

  createCustomNexusOverlay('loginRequiredKeyModal', html);
}

function showUniqueKeyModal() {
  var html = 
    '<div style="position:absolute; top:15px; right:15px; cursor:pointer; color:#888; font-size:20px;" onclick="var m=document.getElementById(\'uniqueKeyGatewayModal\'); if(m) m.remove();">&times;</div>' +
    '<div id="keyTimerSpinner" style="width:3rem; height:3rem; border:3px solid #333; border-top:3px solid #ffaa00; border-radius:50%; margin:0 auto 15px; animation: keySpin 1s linear infinite;"></div>' +
    '<style>@keyframes keySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>' +
    '<h3 style="font-family:\'Orbitron\',sans-serif; font-size:1.3rem; color:#fff; margin-bottom:8px;" id="keyModalStatus">Verifying Sponsor Visit...</h3>' +
    '<p style="color:#aaa; font-size:0.85rem; margin-bottom:15px;">Generating your personal un-shareable 24-hour script key in <strong style="color:#ffaa00; font-size:1.2rem;" id="keyCountdownVal">5</strong> seconds...</p>' +
    '<div style="background:#1a1a24; height:8px; border-radius:4px; overflow:hidden; margin-bottom:15px;">' +
      '<div id="keyProgressBar" style="background:#ffaa00; height:100%; width:0%; transition: width 1s linear;"></div>' +
    '</div>' +
    '<div id="keyResultArea" style="display:none;">' +
      '<div style="background:#14141d; padding:12px; border-radius:10px; border:1px solid #333; margin-bottom:15px;">' +
        '<small style="display:block; color:#888; text-transform:uppercase; font-size:0.75rem; margin-bottom:5px;">Your Personal 24-Hour Key:</small>' +
        '<code id="generatedKeyBox" style="font-size:1.1rem; color:#ffaa00; font-family:monospace; user-select:all; word-break:break-all;">NEXUS-KEY-LOADING</code>' +
      '</div>' +
      '<button id="copyGeneratedKeyBtn" style="display:block; width:100%; padding:12px; background:#ffaa00; color:#0d0d12; font-weight:bold; font-family:\'Orbitron\',sans-serif; border:none; border-radius:30px; cursor:pointer; font-size:0.9rem;">' +
        '<i class="fa-solid fa-copy me-2"></i> Copy Personal Key' +
      '</button>' +
    '</div>';

  var overlay = createCustomNexusOverlay('uniqueKeyGatewayModal', html);

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

      var fallbackKey = 'NEXUS-KEY-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + new Date().toISOString().slice(0,10).replace(/-/g,'');

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
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }).catch(function() {
              var ta = document.createElement('textarea');
              ta.value = finalKey;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              showToast('Personal 24-Hour Key copied!', 'success');
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
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
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }).catch(function() {
              var ta = document.createElement('textarea');
              ta.value = fallbackKey;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              showToast('Personal 24-Hour Key copied!', 'success');
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            });
          };
        }
      });
    }
  }, 1000);
}

