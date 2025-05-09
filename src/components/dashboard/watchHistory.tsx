'use client'
import { components } from '@/lib/backend/apiV1/schema'
import Image from 'next/image'
import Link from 'next/link'

type VideoHistoryResponse = components['schemas']['VideoHistoryResponse']

interface WatchHistoryProps {
    data: VideoHistoryResponse[]
}

export default function WatchHistory({ data }: WatchHistoryProps) {
    return (
        <div className="flex flex-col gap-4 mt-4">
            {data.map((video) => (
                <Link
                    key={`${video.videoId}-${video.createdAt}`}
                    href={`/video-learning/${video.videoId}`}
                    className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                    <div className="relative w-32 h-20">
                        <Image
                            src={video.thumbnailUrl || '/assets/thumb.jpg'}
                            alt={video.title || ''}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-lg">{video.title}</h4>
                        <p className="text-sm text-gray-500">{new Date(video.createdAt || '').toLocaleDateString()}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}
