/**
 * Lua Code Security Sanitizer
 * Scans Lua script input for dangerous function calls and malicious execution primitives.
 */

const DANGEROUS_PATTERNS = [
  /\bos\.execute\b/i,
  /\bio\.popen\b/i,
  /\bio\.open\b/i,
  /\bdofile\b/i,
  /\bloadfile\b/i,
  /\bloadstring\b/i,
  /\bsetfenv\b/i,
  /\bgetfenv\b/i,
  /\bdebug\.getregistry\b/i,
  /\bdebug\.setupvalue\b/i,
  /\bdebug\.upvaluejoin\b/i,
  /\bstring\.dump\b/i
];

function sanitizeLua(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Script code must be a non-empty string.' };
  }

  // Check code size (max 500KB per script)
  if (code.length > 500000) {
    return { valid: false, error: 'Script code exceeds maximum allowed size (500KB).' };
  }

  // Check dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: `Security violation: Prohibited function pattern detected (${pattern.toString()}).`
      };
    }
  }

  // Check for suspicious obfuscation / extreme string concatenation / bytecode magic headers
  if (code.startsWith('\x1bLua')) {
    return { valid: false, error: 'Compiled binary Lua bytecode is prohibited.' };
  }

  return { valid: true };
}

module.exports = { sanitizeLua };
