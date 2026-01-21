import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images : {
    remotePatterns :[
      {
        protocol:'https',
        hostname:'h3.googleusercontent.com'
      }
    ]
  }
};

export default nextConfig;
