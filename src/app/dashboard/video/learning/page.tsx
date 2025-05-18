'use client'

import Search from '@/components/common/search'
import BookmarkIcon from '@/components/icon/bookmarkIcon'
import VideoIcon from '@/components/icon/videoIcon'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type VideoResponse = components['schemas']['VideoResponse']

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
} as const

export default function VideoLearningPage() {
    const router = useRouter()
    const isFirstRender = useRef(true)
    const observerTarget = useRef<HTMLDivElement>(null)

    const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.ALL)
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    const [videoList, setVideoList] = useState<VideoResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const itemsPerPage = 50
    const displayPerPage = 10
    const [displayCount, setDisplayCount] = useState(displayPerPage)
    const [cachedVideos, setCachedVideos] = useState<VideoResponse[]>([])

    // 무한 스크롤 구현
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    // 캐시된 비디오가 있고, 현재 표시된 수가 캐시된 비디오 수보다 작으면
                    if (cachedVideos.length > displayCount) {
                        setDisplayCount((prev) => Math.min(prev + displayPerPage, cachedVideos.length))
                    }
                    // 캐시된 비디오를 모두 보여줬고, 더 불러올 데이터가 있으면
                    else if (hasMore) {
                        setPage((prev) => prev + 1)
                    }
                }
            },
            { threshold: 1.0 },
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoading, cachedVideos.length, displayCount])

    // 비디오 데이터 로드 함수
    const loadVideos = async (pageNum: number, isNewSearch: boolean = false) => {
        try {
            setIsLoading(true)

            const { data: response } = await client.GET('/api/v1/videos/list', {
                params: {
                    query: {
                        req: {
                            q: searchKeyword || undefined,
                            category: selectedCategory.id === 0 ? undefined : String(selectedCategory.id),
                            maxResults: itemsPerPage,
                        },
                    },
                },
            })

            const videos = response?.data || []

            if (isNewSearch) {
                setCachedVideos(videos)
                setDisplayCount(displayPerPage)
                setVideoList(videos.slice(0, displayPerPage))
            } else {
                setCachedVideos((prev) => [...prev, ...videos])
                setVideoList((prev) => [...prev, ...videos.slice(0, displayPerPage)])
            }

            setHasMore(videos.length === itemsPerPage)
        } catch (err) {
            setError('비디오 리스트를 불러오는데 실패했습니다.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // displayCount가 변경될 때마다 화면에 표시되는 비디오 목록 업데이트
    useEffect(() => {
        setVideoList(cachedVideos.slice(0, displayCount))
    }, [displayCount, cachedVideos])

    // 검색어나 카테고리 변경 시
    useEffect(() => {
        setPage(1)
        loadVideos(1, true)
    }, [selectedCategory, searchKeyword])

    // 페이지 변경 시
    useEffect(() => {
        if (page > 1) {
            loadVideos(page)
        }
    }, [page])

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword)
    }

    // 비디오 클릭 핸들러
    const handleVideoClick = (video: VideoResponse) => {
        // URL 쿼리 파라미터로 비디오 제목만 전달
        const queryParams = new URLSearchParams({
            title: video.title || '',
        }).toString()

        router.push(`/dashboard/video/learning/${video.videoId}?${queryParams}`)
    }

    // 카테고리 버튼 동작
    const handleCategoryClick = (category: (typeof CATEGORIES)[keyof typeof CATEGORIES]) => {
        if (selectedCategory.id === category.id) return
        setSelectedCategory(category)
    }

    // 북마크 토글 핸들러
    const handleBookmarkToggle = async (e: React.MouseEvent, videoId: string | undefined) => {
        e.stopPropagation()

        if (!videoId) return

        try {
            const video = videoList.find((v) => v.videoId === videoId)
            const isBookmarked = video?.bookmarked

            // 북마크 상태 토글
            setVideoList((prevList) =>
                prevList.map((video) =>
                    video.videoId === videoId ? { ...video, bookmarked: !video.bookmarked } : video,
                ),
            )

            if (isBookmarked) {
                await client.DELETE('/api/v1/bookmarks/{videoId}', {
                    params: { path: { videoId } },
                })
            } else {
                await client.POST('/api/v1/bookmarks/{videoId}', {
                    params: { path: { videoId } },
                })
            }
        } catch (err) {
            console.error('북마크 토글 중 오류 발생:', err)
            // 실패 시 상태 복구
            setVideoList((prevList) =>
                prevList.map((video) =>
                    video.videoId === videoId ? { ...video, bookmarked: !video.bookmarked } : video,
                ),
            )
        }
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
                            className="group flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-shrink-0 w-120 h-80 relative">
                                {video.thumbnailUrl && video.thumbnailUrl.trim() !== '' ? (
                                    <>
                                        <div className="absolute inset-0">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title || ''}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                        {video.videoId && (
                                            <button
                                                onClick={(e) => handleBookmarkToggle(e, video.videoId)}
                                                className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full 
                                                         opacity-0 group-hover:opacity-100 transition-opacity
                                                         hover:bg-white shadow-sm z-10"
                                                title={video.bookmarked ? '북마크 제거' : '북마크 추가'}
                                            >
                                                <BookmarkIcon
                                                    className={`w-5 h-5 transition-colors ${
                                                        video.bookmarked
                                                            ? 'text-[var(--color-main)] fill-[var(--color-main)]'
                                                            : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-lg font-bold truncate">{video.title || 'Untitled'}</p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-12">
                                    {video.description || 'No description available'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* 로딩 상태 표시 */}
                    {isLoading && (
                        <div className="text-center py-4">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        </div>
                    )}

                    {/* Intersection Observer 타겟 */}
                    <div ref={observerTarget} style={{ height: '10px' }} />

                    {!isLoading && videoList.length === 0 && (
                        <div className="text-gray-500 text-center mt-10">검색 결과가 없습니다.</div>
                    )}
                </div>
            </div>
        </>
    )
}
