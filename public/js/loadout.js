/**
 * Smart Loadout Builder & LocalStorage Merger Script
 */

const LOADOUT_KEY = 'nexus_loadout';

function addToLoadout(id, title, code) {
  try {
    let loadout = JSON.parse(localStorage.getItem(LOADOUT_KEY) || '[]');
    
    // Check if already in loadout
    if (loadout.some(item => item.id == id)) {
      showToast(`"${title}" is already in your loadout!`, 'error');
      return;
    }

    loadout.push({ id, title, code });
    localStorage.setItem(LOADOUT_KEY, JSON.stringify(loadout));
    
    if (typeof updateLoadoutBadge === 'function') {
      updateLoadoutBadge();
    }
    
    showToast(`Added "${title}" to loadout!`, 'success');
  } catch (err) {
    console.error('Error adding to loadout:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loadoutContainer = document.getElementById('loadoutContainer');
  const emptyState = document.getElementById('emptyLoadoutState');
  const mergedPreviewCode = document.getElementById('mergedPreviewCode');
  const copyMergedBtn = document.getElementById('copyMergedBtn');
  const clearLoadoutBtn = document.getElementById('clearLoadoutBtn');

  if (!loadoutContainer) return; // Not on loadout page

  renderLoadout();

  if (clearLoadoutBtn) {
    clearLoadoutBtn.addEventListener('click', () => {
      localStorage.removeItem(LOADOUT_KEY);
      renderLoadout();
      if (typeof updateLoadoutBadge === 'function') updateLoadoutBadge();
      showToast('Cleared loadout items.', 'info');
    });
  }

  if (copyMergedBtn) {
    copyMergedBtn.addEventListener('click', async () => {
      const mergedCode = getMergedScriptCode();
      if (!mergedCode) return;

      try {
        await navigator.clipboard.writeText(mergedCode);
        showToast('Successfully merged and copied master script to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy merged script:', err);
      }
    });
  }

  function renderLoadout() {
    let loadout = [];
    try {
      loadout = JSON.parse(localStorage.getItem(LOADOUT_KEY) || '[]');
    } catch (e) {
      loadout = [];
    }

    loadoutContainer.innerHTML = '';

    if (loadout.length === 0) {
      if (emptyState) emptyState.classList.remove('d-none');
      if (mergedPreviewCode) mergedPreviewCode.textContent = '-- No scripts selected in loadout --';
      if (copyMergedBtn) copyMergedBtn.disabled = true;
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (copyMergedBtn) copyMergedBtn.disabled = false;

    loadout.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card glass-card border-purple rounded-4 overflow-hidden p-3';
      card.innerHTML = `
        <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
          <h5 class="font-orbitron text-neon-cyan mb-0">
            <span class="badge bg-purple me-2">#${index + 1}</span>${escapeHtml(item.title)}
          </h5>
          <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="removeFromLoadout('${item.id}')" title="Remove">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <pre class="bg-dark-gradient p-2 rounded text-secondary font-monospace fs-6 mb-0 overflow-x-auto" style="max-height: 80px;"><code>${escapeHtml(item.code)}</code></pre>
      `;
      loadoutContainer.appendChild(card);
    });

    // Update merged preview code box
    const merged = getMergedScriptCode();
    if (mergedPreviewCode) mergedPreviewCode.textContent = merged;
  }

  window.removeFromLoadout = function(id) {
    let loadout = JSON.parse(localStorage.getItem(LOADOUT_KEY) || '[]');
    loadout = loadout.filter(item => item.id != id);
    localStorage.setItem(LOADOUT_KEY, JSON.stringify(loadout));
    renderLoadout();
    if (typeof updateLoadoutBadge === 'function') updateLoadoutBadge();
    showToast('Removed script from loadout.', 'info');
  };

  function getMergedScriptCode() {
    let loadout = JSON.parse(localStorage.getItem(LOADOUT_KEY) || '[]');
    if (loadout.length === 0) return '';

    const header = `-- ==========================================================\n-- ROBLOX SCRIPT NEXUS - MERGED LOADOUT MASTER SCRIPT\n-- Generated on: ${new Date().toLocaleString()}\n-- Total Scripts: ${loadout.length}\n-- ==========================================================\n\n`;

    const body = loadout.map(item => {
      return `-- ----------------------------------------------------------\n-- [SCRIPT ${item.id}] ${item.title.toUpperCase()}\n-- ----------------------------------------------------------\n${item.code}\n`;
    }).join('\n\n');

    return header + body;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
