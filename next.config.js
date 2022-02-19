/** @type {import('next').NextConfig} */
const { withSuperjson } = require("next-superjson");

const nextConfig = {
    reactStrictMode: true,
};
const withPWA = require("next-pwa");
// module.exports = withSuperjson()(nextConfig);
module.exports = withPWA({
    pwa: {
      dest: "public",
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === "development",
    },
  });
