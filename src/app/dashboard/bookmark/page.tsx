'use client'

import BookmarkIcon from '@/components/icon/bookmarkIcon'
import type { components, paths } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type VideoResponse = components['schemas']['VideoResponse']
type BookmarkResponse = paths['/api/v1/bookmarks']['get']['responses']['200']['content']['application/json']

export default function BookmarkPage() {
    const [videoList, setVideoList] = useState<VideoResponse[]>([])
    const router = useRouter()

    useEffect(() => {
        fetchBookmarks()
    }, [])

    const fetchBookmarks = async () => {
        try {
            const { data, error } = await client.GET('/api/v1/bookmarks')
            if (data && !error) {
                const response = data as BookmarkResponse
                setVideoList(response.data || [])
            }
        } catch (error) {
            console.error('북마크 목록을 가져오는데 실패했습니다:', error)
        }
    }

    const handleVideoClick = (videoId: string) => {
        router.push(`/dashboard/video/${videoId}`)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <BookmarkIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Bookmark</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-200px)]">
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {videoList.map((video) => (
                        <div
                            key={video.videoId}
                            className="flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleVideoClick(video.videoId || '')}
                        >
                            <div className="w-120 h-80 bg-gray-200 rounded-md">
                                {video.thumbnailUrl && (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-bold">{video.title}</p>
                                <p className="text-lg text-gray-500">조회수 0회</p>
                                <p className="text-sm text-gray-700 mt-2">{video.description}</p>
                            </div>
                        </div>
                    ))}

                    {videoList.length === 0 && (
                        <div className="text-gray-500 text-center mt-10">북마크된 영상이 없습니다.</div>
                    )}
                </div>
            </div>
        </>
    )
}
