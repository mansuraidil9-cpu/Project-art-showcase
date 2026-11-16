const nextConfig = {
  async rewrites() {
    return { beforeFiles: [{ source: "/uploads/:filename", destination: "/api/uploads/:filename" }] };
  },
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  outputFileTracingIncludes: {
    "/*": ["./database/queries/**/*.sql"],
  },
};
export default nextConfig;

