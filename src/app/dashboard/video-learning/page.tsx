'use client'

import Search from '@/components/common/search'
import VideoIcon from '@/components/icon/videoIcon'
import client from '@/lib/backend/client'
import { VideoData } from '@/types/video'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// 카테고리 타입 정의
type Category = {
    id: number
    label: string
}

// 카테고리 상수 정의
const CATEGORIES = {
    ALL: { id: 0, label: '전체' },
    SONG: { id: 10, label: '노래' },
    DRAMA: { id: 36, label: '드라마' },
    MOVIE: { id: 30, label: '영화' },
    NEW: { id: -1, label: '새로온 맞춤 동영상' },
} as const

export default function VideoLearningPage() {
    const url = process.env.NEXT_PUBLIC_MOCK_URL
    const router = useRouter()
    const isFirstRender = useRef(true)

    const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.ALL)
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    const [videoList, setVideoList] = useState<VideoData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // api/v1/video/list 호출
    useEffect(() => {
        const loadVideos = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await client.GET('/api/v1/videos/list', {
                    params: {
                        query: {
                            maxResults: 10,
                            ...(selectedCategory.id !== 0 && { category: String(selectedCategory.id) }),
                            ...(searchKeyword && { q: searchKeyword.trim().toLowerCase() }),
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

        // 첫 렌더링 시에는 실행하지 않음
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        loadVideos()
    }, [selectedCategory, searchKeyword])

    // 컴포넌트 마운트 시 최초 1회 데이터 로드
    useEffect(() => {
        const loadInitialVideos = async () => {
            try {
                setIsLoading(true)
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

        loadInitialVideos()
    }, [])

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword)
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

        router.push(`/dashboard/video-learning/${video.videoId}?${queryParams}${thumbnailParam}`)
    }

    // 카테고리 버튼 동작
    const handleCategoryClick = (category: (typeof CATEGORIES)[keyof typeof CATEGORIES]) => {
        if (selectedCategory.id === category.id) return
        setSelectedCategory(category)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <VideoIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Video Learning</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-200px)]">
                {/* 검색 + 필터 */}
                <div className="flex items-center gap-4 w-full mb-4">
                    <Search onSearch={handleSearch} placeholder="video search..." />

                    {/* 카테고리 버튼들 */}
                    <div className="flex gap-2">
                        {Object.values(CATEGORIES).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category)}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                    selectedCategory.id === category.id
                                        ? 'bg-[var(--color-main)] text-white'
                                        : 'bg-[var(--color-sub-1)] text-white'
                                }`}
                            >
                                {category.label}
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
            </div>
        </>
    )
}
