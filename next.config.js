/** @type {import('next').NextConfig} */
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude mcp-server from webpack compilation
    config.module.rules.push({
      test: /mcp-server/,
      use: 'ignore-loader'
    });

    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    
    // Add PrismaPlugin for server-side rendering
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  experimental: {
    externalDir: true
  }
}
