/** @type {import('next').NextConfig} */
const { withSuperjson } = require("next-superjson");

const nextConfig = {
    reactStrictMode: true,
};

module.exports = withSuperjson()(nextConfig);
