import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['team07-mallang-bucket.s3.ap-northeast-2.amazonaws.com'],
    },
}

export default nextConfig
