/**
 * 5-Second AdSense Interstitial Modal & Copy Script Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const copyButtons = document.querySelectorAll('.copy-script-btn');
  const adModal = document.getElementById('copyAdModal');
  const skipAdBtn = document.getElementById('skipAdBtn');
  const adCountdown = document.getElementById('adCountdown');
  const adSpinner = document.getElementById('adSpinner');
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  let activeScriptData = null;
  let countdownInterval = null;
  let bsModalInstance = null;

  if (adModal) {
    bsModalInstance = new bootstrap.Modal(adModal);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const scriptId = btn.getAttribute('data-script-id');
      const scriptTitle = btn.getAttribute('data-script-title');
      const scriptCode = btn.getAttribute('data-script-code');

      activeScriptData = { scriptId, scriptTitle, scriptCode };

      // Check if ad has been shown in this session (cookie check)
      if (getCookie('ad_shown') === '1') {
        // Skip ad modal & copy immediately
        executeCopyAction(activeScriptData);
      } else {
        // Show 5-Second Ad Interstitial Modal
        triggerAdInterstitial();
      }
    });
  });

  function triggerAdInterstitial() {
    if (!bsModalInstance || !skipAdBtn || !adCountdown) return;

    skipAdBtn.disabled = true;
    if (adSpinner) adSpinner.style.display = 'inline-block';
    
    let secondsLeft = 5;
    adCountdown.textContent = secondsLeft;
    skipAdBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2" id="adSpinner"></i> SKIP AD IN <span id="adCountdown">${secondsLeft}</span>s`;

    bsModalInstance.show();

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      secondsLeft--;
      const cdSpan = document.getElementById('adCountdown');
      if (cdSpan) cdSpan.textContent = secondsLeft;

      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        skipAdBtn.disabled = false;
        skipAdBtn.innerHTML = `<i class="fa-solid fa-check me-2"></i> SKIP AD & COPY SCRIPT`;
      }
    }, 1000);
  }

  if (skipAdBtn) {
    skipAdBtn.addEventListener('click', () => {
      if (skipAdBtn.disabled || !activeScriptData) return;

      // Set cookie ad_shown=1 (expires in 1 hour)
      setCookie('ad_shown', '1', 1);

      executeCopyAction(activeScriptData);
      bsModalInstance.hide();
    });
  }

  async function executeCopyAction(data) {
    try {
      // Copy Lua code payload to clipboard
      await navigator.clipboard.writeText(data.scriptCode);

      // Log copy event analytics
      fetch(`/api/scripts/${data.scriptId}/copy-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      }).catch(err => console.error('Copy log error:', err));

      showToast(`Copied "${data.scriptTitle}" to clipboard!`, 'success');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      // Fallback fallback copy method
      fallbackCopyText(data.scriptCode);
      showToast(`Copied "${data.scriptTitle}" to clipboard!`, 'success');
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  // Cookie Helpers
  function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
});
