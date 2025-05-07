'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../dashboardLayout'
import VideoIcon from '@/components/icon/videoIcon'
import Search from '@/components/common/search'
import { useRouter } from 'next/navigation'

interface VideoData {
    videoId: string
    title: string
    description: string
    thumbnailUrl?: string | null // 없을 수도 있으니까 optional, null 허용
}

function Video() {
    const url = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter()

    const [selectedCategory, setSelectedCategory] = useState<string>('전체') // 선택된 카테고리 상태 추가

    const dummyVideos: VideoData[] = [
        {
            videoId: '1',
            title: 'React 기초',
            description: 'React를 배워보자',
            thumbnailUrl: null, // 실제 이미지 없으면 null
        },
        {
            videoId: '2',
            title: '노마드 코더 강의',
            description: '코딩 시작하기',
            thumbnailUrl: null,
        },
        {
            videoId: '3',
            title: '드라마로 배우는 영어',
            description: '재밌게 배우는 영어',
            thumbnailUrl: null,
        },
    ]

    const [videoList, setVideoList] = useState<VideoData[]>(dummyVideos)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // api/v1/video/list 호출 -- 검색어, 카테고리 미추가 (추후 추가)
    useEffect(() => {
        const loadVideos = async () => {
            try {
                const response = await fetch(`${url}/api/v1/video/list`)
                if (!response.ok) {
                    throw new Error('비디오 리스트를 불러오는데 실패했습니다.')
                }
                const data = await response.json()
                setVideoList(data.data)
            } catch (err) {
                setError('비디오 리스트를 불러오는데 실패했습니다.')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        loadVideos()
    }, [])

    const handleSearch = (keyword: string) => {
        const trimmed = keyword.trim().toLowerCase()

        if (!trimmed) {
            // 1. 검색어 비었을 경우: 전체 리스트
            setVideoList(dummyVideos)
            return
        }

        const filtered = dummyVideos.filter(
            (video) => video.title.toLowerCase().includes(trimmed) || video.description.toLowerCase().includes(trimmed),
        )

        // 2. 결과 있으면 → 필터된 결과, 없으면 → 빈 배열
        setVideoList(filtered)
    }

    // 비디오 클릭 핸들러
    const handleVideoClick = (video: VideoData) => {
        router.push(`/video-learning/${video.videoId}`)
    }

    // 카테고리 버튼 동작
    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) return
        setSelectedCategory(category)
        // const filtered = category === '전체' ? dummyVideos : dummyVideos.filter((video) => video.category === category)
        // setVideoList(filtered)
    }

    // 카테고리, 검색어 변경 작동 확인 로그
    // useEffect(() => {
    //     console.log(selectedCategory)
    //     console.log(searchKeyword)
    // }, [selectedCategory, searchKeyword])

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
                                    alt={video.title}
                                    className="w-120 h-80 object-cover rounded-md"
                                />
                            ) : (
                                <div className="w-120 h-80 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="flex flex-col">
                                <p className="text-lg font-bold">{video.title}</p>
                                <p className="text-lg text-gray-500">조회수 0회</p>
                                <p className="text-sm text-gray-700 mt-2 line-clamp-12">{video.description}</p>
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
