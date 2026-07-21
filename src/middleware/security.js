const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://pagead2.googlesyndication.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
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
        "https://lh3.googleusercontent.com",
        "https://*.googleusercontent.com",
        "https://api.dicebear.com",
        "https://pagead2.googlesyndication.com",
        "https://via.placeholder.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://googleads.g.doubleclick.net",
        "https://pagead2.googlesyndication.com"
      ]
    }
  },
  crossOriginEmbedderPolicy: false
});

module.exports = { securityHeaders };
