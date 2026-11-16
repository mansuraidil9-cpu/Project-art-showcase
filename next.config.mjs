const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  outputFileTracingIncludes: {
    "/*": ["./database/queries/**/*.sql"],
  },
};
export default nextConfig;

