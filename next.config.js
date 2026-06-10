/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'talkyone.com',
      'cdn.talkyone.com',
      'oss-cn-hangzhou.aliyuncs.com'
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 移除或禁用 rewrites，等待配置 API_URL 环境变量
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/proxy/:path*',
  //       destination: `${process.env.API_URL}/:path*`,
  //     },
  //   ]
  // },
}

module.exports = nextConfig
