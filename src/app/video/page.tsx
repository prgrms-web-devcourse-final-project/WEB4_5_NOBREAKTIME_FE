'use client'

import { useState } from 'react'
import DashboardLayout from '../dashboardLayout'
import VideoLearning from '../../components/video/videoLearning'
import VideoIcon from '@/components/icon/videoIcon'
function Video() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

    return (
        <DashboardLayout title="Video Learning" icon={<VideoIcon />}>
            {/* 컨텐츠 */}
            {selectedVideo === null ? (
                <>
                    {/* 검색 + 필터 */}
                    <div className="flex items-center gap-4 w-full">
                        {/* 검색창 */}
                        <div className="flex items-center border-[3px] border-[var(--color-main)] bg-[var(--color-white)] rounded-full px-4 py-2 flex-1">
                            <input
                                type="text"
                                placeholder="search..."
                                className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400"
                            />
                            <button className="text-[var(--color-main)]">
                                <img src="/assets/search.svg" alt="search" className="w-8 h-8" />
                            </button>
                        </div>

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
                    <div className="flex flex-col gap-6 overflow-y-auto pr-2 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                            <div
                                key={id}
                                onClick={() => setSelectedVideo(`video-${id}`)} // 👈 클릭 시 상태 변경
                                className="flex gap-4 bg-[var(--color-white)] rounded-lg p-4 cursor-pointer"
                            >
                                <div className="w-120 h-80 bg-gray-200 rounded-md" />
                                <div className="flex flex-col">
                                    <div>
                                        <p className="text-lg font-bold">1 2 Variables</p>
                                        <p className="text-lg text-gray-500">
                                            노마드 코더 Nomad Coders | 조회수 6만회9
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">
                                        📌 니콜라스와 무료로 코딩 공부하기 https://nomadcoders.co <br />
                                        📌 Learn to code for free! https://en.nomadcoders.co
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                // 상세 컴포넌트 보여주기
                <VideoLearning videoId={selectedVideo} onBack={() => setSelectedVideo(null)} />
            )}
        </DashboardLayout>
    )
}

export default Video
