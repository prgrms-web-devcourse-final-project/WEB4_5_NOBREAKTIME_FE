'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../dashboardLayout'
import VideoIcon from '@/components/icon/videoIcon'
import Search from '@/components/common/search'
import { useRouter } from 'next/navigation'
import { VideoData } from '@/types/video'
import client from '@/lib/backend/client'

function Video() {
    const url = process.env.NEXT_PUBLIC_MOCK_URL
    const router = useRouter()

    const [selectedCategory, setSelectedCategory] = useState<string>('전체') // 선택된 카테고리 상태 추가

    const [videoList, setVideoList] = useState<VideoData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // api/v1/video/list 호출 -- 검색어, 카테고리 미추가 (추후 추가)
    useEffect(() => {
        const loadVideos = async () => {
            try {
                setIsLoading(true)
                // openapi-fetch 클라이언트 사용
                const { data, error } = await client.GET('/api/v1/videos/list', {
                    params: {
                        query: {
                            maxResults: 10,
                        },
                    },
                })

                if (error) {
                    console.error('API 오류:', error)
                    throw new Error('비디오 리스트를 불러오는데 실패했습니다.')
                }

                console.log('비디오 데이터:', data)
                if (data?.data) {
                    // @ts-ignore - 타입 에러 무시
                    setVideoList(data.data)
                }
            } catch (err) {
                setError('비디오 리스트를 불러오는데 실패했습니다.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        loadVideos()
    }, [selectedCategory])

    const handleSearch = (keyword: string) => {
        const trimmed = keyword.trim().toLowerCase()

        if (!trimmed) {
            // 1. 검색어 비었을 경우: 전체 리스트
            setIsLoading(true)
            client
                .GET('/api/v1/videos/list', {
                    params: {
                        query: {
                            category: '전체',
                            maxResults: 10,
                        },
                    },
                })
                .then(({ data }) => {
                    if (data?.data) {
                        setVideoList(data.data)
                    }
                })
                .catch((error) => {
                    console.error('API 오류:', error)
                    setVideoList([])
                })
                .finally(() => setIsLoading(false))
            return
        }

        // 검색어가 있는 경우 서버에 검색 요청
        setIsLoading(true)
        client
            .GET('/api/v1/videos/list', {
                params: {
                    query: {
                        q: trimmed,
                        category: selectedCategory,
                        maxResults: 10,
                    },
                },
            })
            .then(({ data }) => {
                if (data?.data) {
                    setVideoList(data.data)
                } else {
                    setVideoList([])
                }
            })
            .catch((error) => {
                console.error('API 오류:', error)
                setVideoList([])
            })
            .finally(() => setIsLoading(false))
    }

    // 비디오 클릭 핸들러
    const handleVideoClick = (video: VideoData) => {
        // URL 쿼리 파라미터로 비디오 정보 전달
        const queryParams = new URLSearchParams({
            title: video.title || '',
            description: video.description || '',
        }).toString()

        // thumbnailUrl이 있는 경우에만 추가
        const thumbnailParam = video.thumbnailUrl ? `&thumbnail=${encodeURIComponent(video.thumbnailUrl)}` : ''

        router.push(`/video-learning/${video.videoId}?${queryParams}${thumbnailParam}`)
    }

    // 카테고리 버튼 동작
    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) return
        setSelectedCategory(category)
    }

    return (
        <DashboardLayout title="Video Learning" icon={<VideoIcon />}>
            <>
                {/* 검색 + 필터 */}
                <div className="flex items-center gap-4 w-full mb-4">
                    <Search onSearch={handleSearch} placeholder="video search..." />

                    {/* 카테고리 버튼들 */}
                    <div className="flex gap-2">
                        {['전체', '노래', '드라마', '영화', '새로온 맞춤 동영상'].map((label) => (
                            <button
                                key={label}
                                onClick={() => handleCategoryClick(label)}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                    selectedCategory === label
                                        ? 'bg-[var(--color-main)] text-white'
                                        : 'bg-[var(--color-sub-1)] text-white'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 동영상 리스트 */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {videoList.map((video) => (
                        <div
                            key={video.videoId}
                            onClick={() => handleVideoClick(video)}
                            className="flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer"
                        >
                            {video.thumbnailUrl && video.thumbnailUrl.trim() !== '' ? (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title || ''}
                                    className="w-120 h-80 object-cover rounded-md"
                                />
                            ) : (
                                <div className="w-120 h-80 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="flex flex-col">
                                <p className="text-lg font-bold">{video.title || 'Untitled'}</p>
                                <p className="text-lg text-gray-500">조회수 0회</p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-12">
                                    {video.description || 'No description available'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {videoList.length === 0 && (
                        <div className="text-gray-500 text-center mt-10">검색 결과가 없습니다.</div>
                    )}
                </div>
            </>
        </DashboardLayout>
    )
}

export default Video
