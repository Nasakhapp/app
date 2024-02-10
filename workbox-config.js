module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,ico,html,png,json}"],
  swDest: "dist/sw.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  maximumFileSizeToCacheInBytes: 10000000,
};
