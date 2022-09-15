module.exports = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  rewrites() {
    return [
      { source: "/.well-known/lnurlp/:username", destination: "/api/lnurlp/:username" },
    ]
  },
}
