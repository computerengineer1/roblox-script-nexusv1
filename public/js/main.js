/**
 * Roblox Script Nexus - High-Performance Luxury Black & Gray UI Engine
 * Features: Web Audio SFX, Custom Cursor, Command Palette (Ctrl+K), Key Gate, Smooth Micro-Interactions
 */

// ==========================================================================
// 1. PROCEDURAL WEB AUDIO API SOUND EFFECTS ENGINE (Zero External Audio Latency)
// ==========================================================================
class SoundFXEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('nexus_sfx_enabled') !== 'false'; // Enabled by default
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('nexus_sfx_enabled', this.enabled ? 'true' : 'false');
    this.updateToggleUI();
    if (this.enabled) {
      this.play('click');
    }
    return this.enabled;
  }

  updateToggleUI() {
    var btns = document.querySelectorAll('.sfx-toggle-btn');
    btns.forEach(btn => {
      btn.innerHTML = this.enabled ? 
        '<i class="fa-solid fa-volume-high text-white"></i> <span class="d-none d-md-inline">SFX ON</span>' : 
        '<i class="fa-solid fa-volume-xmark text-secondary"></i> <span class="d-none d-md-inline">SFX OFF</span>';
    });
  }

  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      var now = this.ctx.currentTime;
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        // High-tech crisp mechanical click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'hover') {
        // Subtle micro-tick on hover
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        osc.start(now);
        osc.stop(now + 0.015);
      } else if (type === 'copy' || type === 'success') {
        // Double-tone harmonic futuristic chime
        var osc2 = this.ctx.createOscillator();
        var gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
        gain2.gain.setValueAtTime(0.09, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.25);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.3);
      } else if (type === 'key' || type === 'unlock') {
        // Cyber security unlock chord
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'modal') {
        // Futuristic low whoosh pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch(e) {
      console.warn('Audio SFX Error:', e);
    }
  }
}

window.nexusSFX = new SoundFXEngine();

// ==========================================================================
// 2. BESPOKE LUXURY CUSTOM CURSOR SYSTEM
// ==========================================================================
function initLuxuryCustomCursor() {
  // Only initialize on desktop pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var dot = document.createElement('div');
  dot.id = 'nexusCursorDot';
  var ring = document.createElement('div');
  ring.id = 'nexusCursorRing';

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var ringX = mouseX;
  var ringY = mouseY;

  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth lerp physics for trailing ring (60fps)
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection for interactive elements
  var hoverTargetSelector = 'a, button, input, select, textarea, .card, .btn, [role="button"], .cursor-pointer, .map-card-col';
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(hoverTargetSelector)) {
      ring.classList.add('cursor-hover');
      window.nexusSFX.play('hover');
    }
  });

  document.addEventListener('mouseout', function(e) {
    if (e.target.closest(hoverTargetSelector)) {
      ring.classList.remove('cursor-hover');
    }
  });

  // Click ripple effect
  document.addEventListener('mousedown', function(e) {
    ring.classList.add('cursor-click');
    window.nexusSFX.play('click');

    var ripple = document.createElement('div');
    ripple.className = 'floating-click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
  });

  document.addEventListener('mouseup', function() {
    ring.classList.remove('cursor-click');
  });

  document.addEventListener('mouseleave', function() {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function() {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

// ==========================================================================
// 3. COMMAND PALETTE SPOTLIGHT SYSTEM (Ctrl + K)
// ==========================================================================
function initCommandPalette() {
  var overlay = document.createElement('div');
  overlay.id = 'nexusCmdPaletteOverlay';
  overlay.innerHTML = `
    <div class="cmd-palette-box">
      <div class="d-flex align-items-center px-3 border-bottom border-zinc">
        <i class="fa-solid fa-magnifying-glass text-secondary me-2"></i>
        <input type="text" id="cmdPaletteInput" class="cmd-input" placeholder="Type a game, script, command, or press ESC to close..." autocomplete="off">
        <span class="kbd-badge">ESC</span>
      </div>
      <div class="cmd-results-list" id="cmdPaletteResults">
        <div class="text-zinc-muted small px-3 py-2 text-uppercase font-orbitron" style="font-size:0.75rem;">Navigation & Quick Actions</div>
        <div class="cmd-item" onclick="window.location.href='/'">
          <div><i class="fa-solid fa-house me-2 text-secondary"></i> Home & Map Vault</div>
          <span class="kbd-badge">H</span>
        </div>
        <div class="cmd-item" onclick="window.location.href='/playground'">
          <div><i class="fa-solid fa-terminal me-2 text-secondary"></i> Interactive Lua Playground</div>
          <span class="kbd-badge">P</span>
        </div>
        <div class="cmd-item" onclick="window.location.href='/loadout'">
          <div><i class="fa-solid fa-layer-group me-2 text-secondary"></i> Saved Loadouts</div>
          <span class="kbd-badge">L</span>
        </div>
        <div class="cmd-item" onclick="window.triggerGetDailyKey(); closeCmdPalette();">
          <div><i class="fa-solid fa-key me-2 text-white"></i> <strong>Generate 24-Hour Script Key</strong></div>
          <span class="kbd-badge">K</span>
        </div>
        <div class="cmd-item" onclick="window.nexusSFX.toggle();">
          <div><i class="fa-solid fa-volume-high me-2 text-secondary"></i> Toggle Sound Effects (SFX)</div>
          <span class="kbd-badge">M</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  var input = document.getElementById('cmdPaletteInput');
  var resultsList = document.getElementById('cmdPaletteResults');

  window.openCmdPalette = function() {
    overlay.classList.add('show');
    window.nexusSFX.play('modal');
    setTimeout(function() { input.focus(); }, 50);
  };

  window.closeCmdPalette = function() {
    overlay.classList.remove('show');
    input.value = '';
  };

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeCmdPalette();
  });

  // Dynamic Live Search in Command Palette
  input.addEventListener('input', function() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      resultsList.innerHTML = `
        <div class="text-zinc-muted small px-3 py-2 text-uppercase font-orbitron" style="font-size:0.75rem;">Navigation & Actions</div>
        <div class="cmd-item" onclick="window.location.href='/'"><div><i class="fa-solid fa-house me-2 text-secondary"></i> Home & Map Vault</div><span class="kbd-badge">H</span></div>
        <div class="cmd-item" onclick="window.location.href='/playground'"><div><i class="fa-solid fa-terminal me-2 text-secondary"></i> Lua Playground</div><span class="kbd-badge">P</span></div>
        <div class="cmd-item" onclick="window.triggerGetDailyKey(); closeCmdPalette();"><div><i class="fa-solid fa-key me-2 text-white"></i> <strong>Generate 24-Hour Script Key</strong></div><span class="kbd-badge">K</span></div>
      `;
      return;
    }

    fetch('/api/search?q=' + encodeURIComponent(q))
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          resultsList.innerHTML = '<div class="p-4 text-center text-zinc-muted small">No maps or scripts matching "' + q + '"</div>';
          return;
        }
        var html = '<div class="text-zinc-muted small px-3 py-2 text-uppercase font-orbitron" style="font-size:0.75rem;">Matching Vault Items (' + data.length + ')</div>';
        data.forEach(item => {
          html += `
            <div class="cmd-item" onclick="window.location.href='/map/${item.id}'">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-cube text-secondary"></i>
                <span class="text-white">${item.name}</span>
                <span class="text-zinc-subtle small ms-2">${item.script_count || 0} Scripts</span>
              </div>
              <span class="kbd-badge">ENTER</span>
            </div>
          `;
        });
        resultsList.innerHTML = html;
      })
      .catch(() => {});
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl + K or Cmd + K -> Open Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('show')) closeCmdPalette();
      else openCmdPalette();
    }
    // ESC -> Close modals & command palette
    if (e.key === 'Escape') {
      closeCmdPalette();
      var m1 = document.getElementById('loginRequiredKeyModal'); if (m1) m1.remove();
      var m2 = document.getElementById('uniqueKeyGatewayModal'); if (m2) m2.remove();
      var m3 = document.getElementById('keyboardShortcutsModal'); if (m3) m3.remove();
    }
    // '?' -> Open Keyboard Shortcuts Guide (when not typing in an input)
    if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      showKeyboardShortcutsModal();
    }
    // 'm' or 'M' -> Toggle SFX (when not typing in an input)
    if (e.key.toLowerCase() === 'm' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      window.nexusSFX.toggle();
    }
  });
}

// Shows Keyboard Shortcuts Guide Modal
function showKeyboardShortcutsModal() {
  var html = `
    <div style="position:absolute; top:15px; right:18px; cursor:pointer; color:#888; font-size:22px;" onclick="var m=document.getElementById('keyboardShortcutsModal'); if(m) m.remove();">&times;</div>
    <div style="font-size: 2.2rem; color: #ffffff; margin-bottom: 12px;"><i class="fa-solid fa-keyboard"></i></div>
    <h3 style="font-family:'Orbitron',sans-serif; font-size:1.3rem; color:#fff; margin-bottom:15px; font-weight:bold;">KEYBOARD SHORTCUTS</h3>
    <div style="text-align:left; font-size:0.85rem; color:#d4d4d8; margin-bottom:20px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:6px;">
        <span>Open Command Spotlight</span>
        <span class="kbd-badge">Ctrl + K</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:6px;">
        <span>Focus Instant Search</span>
        <span class="kbd-badge">/</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:6px;">
        <span>Toggle Sound Effects (SFX)</span>
        <span class="kbd-badge">M</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:6px;">
        <span>Close Any Modal / Dialog</span>
        <span class="kbd-badge">ESC</span>
      </div>
    </div>
    <button onclick="var m=document.getElementById('keyboardShortcutsModal'); if(m) m.remove();" style="display:block; width:100%; padding:10px; background:#ffffff; color:#050507; font-weight:bold; border:none; border-radius:30px; cursor:pointer; font-family:'Orbitron',sans-serif; font-size:0.85rem;">
      GOT IT 👍
    </button>
  `;
  createCustomNexusOverlay('keyboardShortcutsModal', html);
}

// ==========================================================================
// 4. DAILY KEY GENERATOR SYSTEM (Titanium Monochrome Theme)
// ==========================================================================
window.triggerGetDailyKey = function triggerGetDailyKey(e) {
  window.nexusSFX.play('click');
  if (!window.currentUser) {
    showLoginRequiredModal();
    return;
  }
  try {
    var adUrl = window.adGatewayUrl || 'https://www.effectivecpmnetwork.com/ceafmimnp?key=f32f759ee712c2d7c1dd08569741cc49';
    window.open(adUrl, '_blank');
  } catch(err) {
    console.warn('Ad gateway open error:', err);
  }
  setTimeout(function() { showUniqueKeyModal(); }, 300);
};

// Standalone Titanium Overlay Modal Creator
function createCustomNexusOverlay(modalId, innerHtml) {
  var old = document.getElementById(modalId);
  if (old && old.parentNode) old.parentNode.removeChild(old);

  var overlay = document.createElement('div');
  overlay.id = modalId;
  overlay.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(5, 5, 7, 0.92) !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 15px !important; box-sizing: border-box !important; opacity: 1 !important; visibility: visible !important;';

  var dialog = document.createElement('div');
  dialog.style.cssText = 'width: 100% !important; max-width: 460px !important; background: #0c0c10 !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 20px !important; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(255,255,255,0.06) !important; padding: 28px !important; text-align: center !important; color: #ffffff !important; position: relative !important; font-family: "Inter", sans-serif !important;';

  dialog.innerHTML = innerHtml;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  window.nexusSFX.play('modal');

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  });

  return overlay;
}

// Shows Sign In Required Modal (Titanium Theme)
function showLoginRequiredModal() {
  var html = 
    '<div style="position:absolute; top:15px; right:18px; cursor:pointer; color:#888; font-size:22px;" onclick="var m=document.getElementById(\'loginRequiredKeyModal\'); if(m) m.remove();">&times;</div>' +
    '<div style="font-size: 2.8rem; color: #ffffff; margin-bottom: 10px;"><i class="fa-solid fa-shield-halved"></i></div>' +
    '<h3 style="font-family:\'Orbitron\',sans-serif; font-size:1.35rem; color:#fff; margin-bottom:10px; font-weight:bold;">ACCOUNT REQUIRED</h3>' +
    '<p style="color:#a1a1aa; font-size:0.9rem; margin-bottom:20px; line-height:1.5;">You must be signed in to generate your unique 24-hour executor key. Please create a free account or sign in to continue!</p>' +
    '<a href="/profile" style="display:block; width:100%; padding:14px; background:#ffffff; color:#050507; font-weight:bold; font-family:\'Orbitron\',sans-serif; text-decoration:none; border-radius:30px; margin-bottom:10px; font-size:0.95rem; box-shadow: 0 4px 20px rgba(255,255,255,0.25); box-sizing:border-box;">' +
      '<i class="fa-solid fa-right-to-bracket me-2"></i> SIGN IN / CREATE ACCOUNT' +
    '</a>' +
    '<button onclick="var m=document.getElementById(\'loginRequiredKeyModal\'); if(m) m.remove();" style="display:block; width:100%; padding:10px; background:transparent; color:#71717a; border:1px solid #27272a; border-radius:30px; cursor:pointer; font-size:0.85rem;">' +
      'Cancel' +
    '</button>';

  createCustomNexusOverlay('loginRequiredKeyModal', html);
}

// Shows Unique Key Modal (Titanium Theme)
function showUniqueKeyModal() {
  var html = 
    '<div style="position:absolute; top:15px; right:18px; cursor:pointer; color:#888; font-size:22px;" onclick="var m=document.getElementById(\'uniqueKeyGatewayModal\'); if(m) m.remove();">&times;</div>' +
    '<div id="keyTimerSpinner" style="width:2.8rem; height:2.8rem; border:3px solid #27272a; border-top:3px solid #ffffff; border-radius:50%; margin:0 auto 15px; animation: keySpin 1s linear infinite;"></div>' +
    '<style>@keyframes keySpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>' +
    '<h3 style="font-family:\'Orbitron\',sans-serif; font-size:1.3rem; color:#fff; margin-bottom:8px;" id="keyModalStatus">Verifying Sponsor Access...</h3>' +
    '<p style="color:#a1a1aa; font-size:0.85rem; margin-bottom:15px;">Generating your personal 24-hour key in <strong style="color:#ffffff; font-size:1.2rem;" id="keyCountdownVal">5</strong> seconds...</p>' +
    '<div style="background:#18181b; height:6px; border-radius:3px; overflow:hidden; margin-bottom:18px; border:1px solid #27272a;">' +
      '<div id="keyProgressBar" style="background:#ffffff; height:100%; width:0%; transition: width 1s linear;"></div>' +
    '</div>' +
    '<div id="keyResultArea" style="display:none;">' +
      '<div style="background:#141418; padding:14px; border-radius:12px; border:1px solid #27272a; margin-bottom:15px;">' +
        '<small style="display:block; color:#71717a; text-transform:uppercase; font-size:0.75rem; margin-bottom:6px; letter-spacing:0.5px;">Your Personal 24-Hour Key:</small>' +
        '<code id="generatedKeyBox" style="font-size:1.15rem; color:#ffffff; font-family:monospace; user-select:all; word-break:break-all; font-weight:bold;">NEXUS-KEY-LOADING</code>' +
      '</div>' +
      '<button id="copyGeneratedKeyBtn" style="display:block; width:100%; padding:13px; background:#ffffff; color:#050507; font-weight:bold; font-family:\'Orbitron\',sans-serif; border:none; border-radius:30px; cursor:pointer; font-size:0.9rem; box-shadow: 0 0 20px rgba(255,255,255,0.3);">' +
        '<i class="fa-solid fa-copy me-2"></i> COPY 24-HOUR KEY' +
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
      if (statusTxt) statusTxt.textContent = 'Key Unlocked & Ready!';
      window.nexusSFX.play('key');

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
            window.nexusSFX.play('copy');
            if (navigator.clipboard) {
              navigator.clipboard.writeText(finalKey);
            }
            showToast('Personal 24-Hour Key copied to clipboard!', 'success');
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          };
        }
      })
      .catch(function() {
        if (keyBox) keyBox.textContent = fallbackKey;
        if (resultArea) resultArea.style.display = 'block';
        if (copyBtn) {
          copyBtn.onclick = function() {
            window.nexusSFX.play('copy');
            if (navigator.clipboard) {
              navigator.clipboard.writeText(fallbackKey);
            }
            showToast('Personal 24-Hour Key copied to clipboard!', 'success');
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          };
        }
      });
    }
  }, 1000);
}

// ==========================================================================
// 5. INITIALIZATION & CORE CLIENT HANDLERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
  initLuxuryCustomCursor();
  initCommandPalette();
  updateLoadoutBadge();
  initCopyAdGateway();
  initAntiAdBlockDetector();
  window.nexusSFX.updateToggleUI();

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

// Anti-AdBlock & Brave Shields Detection System (Titanium Theme)
function initAntiAdBlockDetector() {
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
  }, 800);
}

function showAntiAdBlockModal() {
  if (document.getElementById('antiAdBlockModal')) return;

  const modal = document.createElement('div');
  modal.id = 'antiAdBlockModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 7, 0.95); backdrop-filter: blur(14px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;';

  modal.innerHTML = `
    <div class="glass-card border-zinc rounded-4 p-4 p-md-5 max-w-600 text-center shadow-lg position-relative" style="background:#0c0c10; border:1px solid rgba(255,255,255,0.15);">
      <div style="position:absolute; top:15px; right:20px; cursor:pointer; color:#aaa; font-size:24px; font-weight:bold;" onclick="document.getElementById('antiAdBlockModal').remove(); document.body.style.overflow='auto';">&times;</div>
      <div class="bg-dark p-3 rounded-circle border border-secondary d-inline-block mb-3">
        <i class="fa-solid fa-shield-halved text-white fs-1"></i>
      </div>
      <h3 class="font-orbitron text-white fw-bold mb-2">ADBLOCKER DETECTED</h3>
      <p class="text-zinc-muted small mb-4">
        Our Roblox scripts and executor vault are <strong>100% Free</strong> and supported by ad sponsors.
      </p>

      <div class="p-3 rounded-3 text-start border border-secondary mb-4 small text-zinc-light" style="background:#141418;">
        <h6 class="font-orbitron text-white mb-2"><i class="fa-solid fa-circle-info me-1"></i> How to unlock scripts:</h6>
        <ol class="mb-0 ps-3 text-zinc-muted">
          <li class="mb-1">Click the <strong>Shield / AdBlock icon</strong> in your browser address bar.</li>
          <li class="mb-1">Select <strong>"Turn off Shields"</strong> or <strong>"Pause on this site"</strong>.</li>
          <li>Click the <strong>"Refresh Page"</strong> button below.</li>
        </ol>
      </div>

      <div class="d-flex gap-2">
        <button onclick="window.location.reload()" class="btn btn-zinc-white flex-grow-1 rounded-pill font-orbitron fw-bold py-3">
          <i class="fa-solid fa-rotate-right me-2"></i> REFRESH PAGE
        </button>
        <button onclick="document.getElementById('antiAdBlockModal').remove(); document.body.style.overflow='auto';" class="btn btn-outline-secondary rounded-pill px-4 font-orbitron text-white">
          DISMISS
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Copy & Smartlink Ad Gateway Handler
function initCopyAdGateway() {
  document.addEventListener('click', function(e) {
    const copyBtn = e.target.closest('.copy-script-btn');
    if (!copyBtn) return;
    
    e.preventDefault();
    const scriptId = copyBtn.getAttribute('data-script-id');
    const rawCode = copyBtn.getAttribute('data-script-code');

    window.nexusSFX.play('copy');
    
    if (rawCode) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(rawCode).then(() => {
          showToast('Script loadstring copied to clipboard!', 'success');
        });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = rawCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Script loadstring copied!', 'success');
      }
    }
  });
}

// Sleek Toast Notification Handler
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white border-0 mb-2 show glass-card';
  toastEl.style.background = '#0c0c10';
  toastEl.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  toastEl.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
  
  toastEl.innerHTML = `
    <div class="d-flex p-3">
      <div class="toast-body d-flex align-items-center">
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-white' : type === 'error' ? 'fa-circle-exclamation text-danger' : 'fa-circle-info text-secondary'} me-2 fs-5"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    toastEl.remove();
  }, 3500);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '9999999';
  document.body.appendChild(container);
  return container;
}
