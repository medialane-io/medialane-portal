import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/integrate",
        destination: "/developers",
        permanent: true,
      },
      {
        source: "/features",
        destination: "/developers",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "https://docs.medialane.io/docs",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "https://docs.medialane.io/docs/:path*",
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  serverExternalPackages: ["pg", "pg-native"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        "pg-native": false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        ws: false,
        "pg-native": false,
      };
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
