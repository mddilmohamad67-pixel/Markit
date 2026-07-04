const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'hi', 'ur'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
});
