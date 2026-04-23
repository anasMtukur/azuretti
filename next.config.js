const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    // Force the '@' alias to point to the 'src' directory
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config;
  },
};

module.exports = nextConfig;