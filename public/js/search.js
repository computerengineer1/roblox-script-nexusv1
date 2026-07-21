/**
 * Instant Live Full-Text Visual Search Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchResultsList = document.getElementById('searchResultsList');
  const searchBtn = document.getElementById('searchBtn');

  if (!searchInput || !searchResults || !searchResultsList) return;

  let debounceTimer = null;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) {
      searchResults.classList.add('d-none');
      searchResultsList.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchSearchResults(query);
    }, 250);
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        fetchSearchResults(query);
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('d-none');
    }
  });

  async function fetchSearchResults(query) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const maps = await response.json();
      searchResultsList.innerHTML = '';

      if (maps.length === 0) {
        searchResultsList.innerHTML = `
          <div class="p-3 text-zinc-muted text-center font-orbitron small">
            <i class="fa-solid fa-ghost me-2"></i>No game maps found matching "${escapeHtml(query)}"
          </div>
        `;
      } else {
        maps.forEach(map => {
          const item = document.createElement('a');
          item.href = `/map/${map.id}`;
          item.className = 'list-group-item list-group-item-action bg-transparent text-white border-0 search-item-hover d-flex align-items-center justify-content-between p-3 rounded-3';
          item.innerHTML = `
            <div class="d-flex align-items-center gap-3">
              <img src="${map.image || 'https://via.placeholder.com/60/09090b/27272a?text=' + encodeURIComponent(map.name)}" class="rounded-2 object-fit-cover border border-secondary" style="width: 52px; height: 38px;" alt="${escapeHtml(map.name)}">
              <div>
                <h6 class="font-orbitron text-white mb-0">${escapeHtml(map.name)}</h6>
                <small class="text-zinc-muted line-clamp-1">${escapeHtml(map.description || '')}</small>
              </div>
            </div>
            <span class="badge bg-dark border border-secondary text-zinc-light font-orbitron">${map.script_count || 0} Scripts</span>
          `;
          searchResultsList.appendChild(item);
        });
      }

      searchResults.classList.remove('d-none');
    } catch (err) {
      console.error('Search fetch error:', err);
    }
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
