'use client'

import BookmarkIcon from '@/components/icon/bookmarkIcon'
import type { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type VideoResponse = components['schemas']['VideoResponse'] & {
    duration?: string
}

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
                setVideoList(data.data || [])
            }
        } catch (error) {
            console.error('북마크 목록을 가져오는데 실패했습니다:', error)
        }
    }

    const handleVideoClick = (videoId: string) => {
        router.push(`/dashboard/video/learning/${videoId}`)
    }

    const handleBookmarkToggle = async (e: React.MouseEvent, videoId: string | undefined) => {
        e.stopPropagation()

        if (!videoId) return

        try {
            // 북마크 상태 토글
            setVideoList((prevList) => prevList.filter((video) => video.videoId !== videoId))

            await client.DELETE('/api/v1/bookmarks/{videoId}', {
                params: { path: { videoId } },
            })
        } catch (err) {
            console.error('북마크 취소 중 오류 발생:', err)
            // 실패 시 상태 복구
            fetchBookmarks()
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <BookmarkIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Bookmark</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-120px)]">
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {videoList.map((video) => (
                        <div
                            key={video.videoId}
                            className="group flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer hover:bg-gray-50"
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

                                        {video.videoId && (
                                            <button
                                                onClick={(e) => handleBookmarkToggle(e, video.videoId)}
                                                className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full 
                                                         opacity-0 group-hover:opacity-100 transition-opacity
                                                         hover:bg-white shadow-sm z-10"
                                                title="북마크 제거"
                                            >
                                                <BookmarkIcon className="w-5 h-5 text-[var(--color-main)] fill-[var(--color-main)]" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-bold">{video.title}</p>
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
