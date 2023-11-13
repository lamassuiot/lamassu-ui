const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    console: require.resolve("console-browserify"),
    crypto: require.resolve("crypto-browserify"), //can be polyfilled here if needed
    net: false,
    'process/browser': require.resolve('process/browser'),
    stream: false, // require.resolve("stream-browserify") //can be polyfilled here if needed
    assert:  require.resolve("assert"), //can be polyfilled here if needed
    http: false, // require.resolve("stream-http") //can be polyfilled here if needed
    https: false, // require.resolve("https-browserify") //can be polyfilled here if needed
    os: false, // require.resolve("os-browserify") //can be polyfilled here if needed
    url: false, // require.resolve("url") //can be polyfilled here if needed
    zlib: false, // require.resolve("browserify-zlib") //can be polyfilled here if needed
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};