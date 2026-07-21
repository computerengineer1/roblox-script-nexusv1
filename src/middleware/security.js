const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Bootstrap & dynamic component scripts
        "https://pagead2.googlesyndication.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
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
        "https://pagead2.googlesyndication.com",
        "https://via.placeholder.com"
      ],
      connectSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://googleads.g.doubleclick.net",
        "https://pagead2.googlesyndication.com"
      ]
    }
  },
  crossOriginEmbedderPolicy: false
});

module.exports = { securityHeaders };
