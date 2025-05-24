'use client'

import HistoryIcon from '@/components/icon/historyIcon'
import type { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type VideoHistoryResponse = components['schemas']['VideoHistoryResponse'] & {
    duration?: string
}

export default function HistoryPage() {
    const [videoList, setVideoList] = useState<VideoHistoryResponse[]>([])
    const router = useRouter()

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data, error } = await client.GET('/api/v1/videohistory/videos/history')
            if (data && !error) {
                setVideoList(data.data || [])
            }
        } catch (error) {
            console.error('시청 기록을 가져오는데 실패했습니다:', error)
        }
    }

    const handleVideoClick = (videoId: string) => {
        router.push(`/dashboard/video/learning/${videoId}`)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <HistoryIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">History</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-120px)]">
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {videoList.map((video) => (
                        <div
                            key={video.videoId}
                            className="flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleVideoClick(video.videoId || '')}
                        >
                            <div className="w-[450px] h-[300px] bg-gray-200 rounded-md overflow-hidden flex-shrink-0 relative">
                                {video.thumbnailUrl && (
                                    <>
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover rounded-md"
                                        />

                                        {/* 동영상 길이 표시 */}
                                        {typeof video.duration === 'string' && video.duration.trim() !== '' && (
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {video.duration}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-bold">{video.title}</p>
                                <p className="text-sm text-gray-700 mt-2">
                                    마지막 시청: {video.lastViewedAt && formatDate(video.lastViewedAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {videoList.length === 0 && (
                        <div className="text-gray-500 text-center mt-10">시청 기록이 없습니다.</div>
                    )}
                </div>
            </div>
        </>
    )
}
