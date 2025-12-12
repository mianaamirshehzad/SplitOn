// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude Node.js core modules and server-side packages
config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/body-parser\/.*/,
    /node_modules\/express\/.*/,
  ],
};

module.exports = config;
