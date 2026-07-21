/**
 * Script Playground & CodeMirror Sandboxed Execution Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  const luaTextarea = document.getElementById('luaCodeEditor');
  const templateSelect = document.getElementById('templateSelect');
  const clearEditorBtn = document.getElementById('clearEditorBtn');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const runScriptBtn = document.getElementById('runScriptBtn');
  const consoleOutput = document.getElementById('consoleOutput');

  if (!luaTextarea) return;

  // Initialize CodeMirror editor instance
  let editor = null;
  if (typeof CodeMirror !== 'undefined') {
    editor = CodeMirror.fromTextArea(luaTextarea, {
      mode: 'lua',
      theme: 'dracula',
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4
    });
  }

  if (clearEditorBtn && editor) {
    clearEditorBtn.addEventListener('click', () => {
      editor.setValue('');
      editor.focus();
    });
  }

  if (clearConsoleBtn && consoleOutput) {
    clearConsoleBtn.addEventListener('click', () => {
      consoleOutput.innerHTML = '<div class="text-secondary font-italic">[Console Cleared.]</div>';
    });
  }

  if (templateSelect && editor) {
    templateSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'default') {
        editor.setValue(`-- Custom Lua Script Playground\nprint("Hello from Roblox Script Nexus!")`);
      } else {
        editor.setValue(`-- Map ${val} Execution Template\nlocal Library = loadstring(game:HttpGet("https://raw.githubusercontent.com/nexus/lib/main.lua"))()\nlocal Window = Library:CreateWindow("Nexus Map ${val} Hub")\n\nWindow:CreateToggle("Auto Farm", function(state)\n    print("[NEXUS] Auto Farm status: " .. tostring(state))\nend)`);
      }
    });
  }

  if (runScriptBtn && consoleOutput) {
    runScriptBtn.addEventListener('click', () => {
      const code = editor ? editor.getValue() : luaTextarea.value;
      
      appendConsoleLog(`[SYSTEM] Initializing Roblox Lua Sandboxed Runtime environment...`, 'system');
      
      setTimeout(() => {
        // Parse print statements inside code for simulated console output
        const lines = code.split('\n');
        let printCount = 0;

        lines.forEach(line => {
          const match = line.match(/print\s*\((.*?)\)/);
          if (match) {
            printCount++;
            let cleanLog = match[1].replace(/^["']|["']$/g, '');
            appendConsoleLog(`[OUTPUT] ${cleanLog}`, 'info');
          }
        });

        if (printCount === 0) {
          appendConsoleLog(`[OUTPUT] Script compiled and executed successfully with 0 output logs.`, 'success');
        } else {
          appendConsoleLog(`[SYSTEM] Execution finished with 0 errors. All thread workers active.`, 'success');
        }
      }, 300);
    });
  }

  function appendConsoleLog(message, type) {
    if (!consoleOutput) return;
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `mb-1 ${type === 'error' ? 'text-danger' : type === 'success' ? 'text-success font-orbitron' : type === 'system' ? 'text-neon-cyan font-orbitron' : 'text-light'}`;
    line.innerHTML = `<span class="text-secondary me-2">[${time}]</span> ${escapeHtml(message)}`;
    
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
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
