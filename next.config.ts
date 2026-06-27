import type { NextConfig } from "next";

const backendApiUrl =
  process.env.BACKEND_API_URL ?? "http://54.116.153.193:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t1.kakaocdn.net" },
      { protocol: "https", hostname: "developers.kakao.com" },
    ],
  },
  /** 로컬 개발 시 CORS 없이 EC2 API 호출 (브라우저 → localhost:3000/api-proxy → EC2) */
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
      {
        source: "/auth/google/callback",
        destination: "/auth/google",
      },
    ];
  },
};

export default nextConfig;
