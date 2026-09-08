/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app lives in a monorepo alongside a separate root package.json, so
  // Turbopack can't reliably infer the workspace root. Pin it to this folder.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
