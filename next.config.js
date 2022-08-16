const withPWA = require("next-pwa")

module.exports = withPWA({
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  rewrites() {
    return [
      { source: "/.well-known/lnurlp/:username", destination: "/api/lnurlp/:username" },
    ]
  },
})
