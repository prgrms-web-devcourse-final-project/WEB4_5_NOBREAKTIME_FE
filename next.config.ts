import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['i.ytimg.com', 'team07-mallang-bucket.s3.ap-northeast-2.amazonaws.com'],
    },
}

export default nextConfig
