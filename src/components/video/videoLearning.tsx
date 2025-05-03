'use client'

import { useState } from 'react'
import VideoTab from './videoTab'
import VideoScript from './videoScript'

interface VideoData {
    id: string
    title: string
    description: string
    thumbnail?: string // 없을 수도 있으니까 optional
}

interface Props {
    video: VideoData
    onBack: () => void
}

function VideoLearning({ video, onBack }: Props) {
    const [fontSize, setFontSize] = useState(16)

    return (
        <div className="flex flex-col gap-4 h-full">
            <button onClick={onBack} className="text-[var(--color-main)] font-semibold w-full text-right">
                &larr; 목록으로
            </button>

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                {/* 비디오 + 트랜스크립트 */}
                <div className="flex flex-row gap-4 w-full h-full">
                    <div className="w-full bg-gray-300 rounded-sm">상세보기: 영상 {video.id}</div>

                    {/* 트랜스크립트 */}
                    <VideoScript />
                </div>

                {/* 제목 + 부가기능 */}
                <div className="flex justify-between items-center w-full h-20">
                    <h3>{video.title}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFontSize((prev) => Math.max(12, prev - 4))}>
                            <img src="/assets/minus.svg" alt="video" className="w-6 h-6" />
                        </button>

                        <img src="/assets/font-size.svg" alt="video" className="w-6 h-6" />
                        <span className="text-sm font-bold">{fontSize}px</span>
                        <button onClick={() => setFontSize((prev) => Math.min(40, prev + 4))}>
                            <img src="/assets/plus.svg" alt="video" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 하단 탭 메뉴 */}
                <VideoTab fontSize={fontSize} />
            </div>
        </div>
    )
}

export default VideoLearning
