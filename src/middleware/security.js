const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://accounts.google.com",
        "https://pagead2.googlesyndication.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://*.highperformanceformat.com",
        "https://*.effectivecpmnetwork.com",
        "https://*.monetag.com",
        "https://*.adsterra.com",
        "https://*.hilltopads.com",
        "https://*.propellerads.com",
        "https://*.work.ink",
        "https://*.lootlabs.gg"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:"
      ],
      connectSrc: [
        "'self'",
        "https:",
        "http:",
        "https://accounts.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://googleads.g.doubleclick.net",
        "https://pagead2.googlesyndication.com",
        "https://*.highperformanceformat.com",
        "https://*.effectivecpmnetwork.com",
        "https://*.monetag.com",
        "https://*.adsterra.com",
        "https://*.hilltopads.com",
        "https://*.work.ink",
        "https://*.lootlabs.gg"
      ]
    }
  },
  crossOriginEmbedderPolicy: false
});

module.exports = { securityHeaders };
