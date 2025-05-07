'use client'

import { useState } from 'react'
import DashboardLayout from '../dashboardLayout'
import VideoLearning from '../../components/video/videoLearning'
import VideoIcon from '@/components/icon/videoIcon'
import Search from '@/components/common/search'

interface VideoData {
    id: string
    title: string
    description: string
    thumbnail?: string // 없을 수도 있으니까 optional
}

function Video() {
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)

    const dummyVideos: VideoData[] = [
        {
            id: '1',
            title: 'React 기초',
            description: 'React를 배워보자',
            thumbnail: '', // 실제 이미지 없으면 공백
        },
        {
            id: '2',
            title: '노마드 코더 강의',
            description: '코딩 시작하기',
            thumbnail: '',
        },
        {
            id: '3',
            title: '드라마로 배우는 영어',
            description: '재밌게 배우는 영어',
            thumbnail: '',
        },
    ]

    const [videoList, setVideoList] = useState<VideoData[]>(dummyVideos)

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

    return (
        <DashboardLayout title="Video Learning" icon={<VideoIcon />}>
            {selectedVideo === null ? (
                <>
                    {/* 검색 + 필터 */}
                    <div className="flex items-center gap-4 w-full mb-4">
                        <Search onSearch={handleSearch} placeholder="video search..." />

                        {/* 카테고리 버튼들 */}
                        <div className="flex gap-2">
                            {['전체', '노래', '드라마', '영화', '새로온 맞춤 동영상'].map((label) => (
                                <button
                                    key={label}
                                    className="px-3 py-1 rounded bg-[var(--color-sub-1)] text-sm font-medium text-white"
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
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className="flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer"
                            >
                                <div className="w-120 h-80 bg-gray-200 rounded-md" />
                                <div className="flex flex-col">
                                    <p className="text-lg font-bold">{video.title}</p>
                                    <p className="text-lg text-gray-500">조회수 0회</p>
                                    <p className="text-sm text-gray-700 mt-2">{video.description}</p>
                                </div>
                            </div>
                        ))}

                        {videoList.length === 0 && (
                            <div className="text-gray-500 text-center mt-10">검색 결과가 없습니다.</div>
                        )}
                    </div>
                </>
            ) : (
                <VideoLearning video={selectedVideo} onBack={() => setSelectedVideo(null)} />
            )}
        </DashboardLayout>
    )
}

export default Video
