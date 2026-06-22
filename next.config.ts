import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t1.kakaocdn.net" },
      { protocol: "https", hostname: "developers.kakao.com" },
    ],
  },
};

export default nextConfig;
