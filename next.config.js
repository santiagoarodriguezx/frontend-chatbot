/** @type {import('next').NextConfig} */
const allowedOrigins = (
  process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || "localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins },
  },
};

module.exports = nextConfig;
