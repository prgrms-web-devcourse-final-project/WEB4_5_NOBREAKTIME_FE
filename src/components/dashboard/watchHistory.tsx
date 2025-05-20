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
        <div className="flex gap-4 overflow-x-auto h-full">
            {data.map((video) => (
                <Link
                    key={`${video.videoId}-${video.lastViewedAt}`}
                    href={`/dashboard/video/learning/${video.videoId}`}
                    className="flex-shrink-0 w-48 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                    <div className="relative w-full aspect-video mb-1">
                        <Image
                            src={video.thumbnailUrl || '/assets/thumb.jpg'}
                            alt={video.title || ''}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="p-1">
                        <h4 className="font-semibold text-xs line-clamp-2">{video.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(video.lastViewedAt || '').toLocaleDateString()}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}
