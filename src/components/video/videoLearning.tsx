'use client'

import { useState, useEffect, useRef } from 'react'
import VideoTab from './videoTab'
import VideoScript from './videoScript'
import WordModal from './wordModal'
import Image from 'next/image'

interface VideoData {
    videoId: string
    title: string
    description: string
    thumbnail?: string // 없을 수도 있으니까 optional
}

interface Keyword {
    word: string
    meaning: string
    difficulity: number
}

interface SubtitleResult {
    startTime: string
    endTime: string
    speaker: string
    original: string
    transcript: string
    keywords: Keyword[]
}

interface AnalysisData {
    subtitleResults: SubtitleResult[]
}

interface Props {
    video: VideoData
    analysisData: AnalysisData | null
    onBack: () => void
    isLoading: boolean
}

function parseTimeToSeconds(time: string) {
    const [h, m, s] = time.split(':')
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
}

function VideoLearning({ video, analysisData: initialAnalysisData, onBack, isLoading: initialIsLoading }: Props) {
    const [fontSize, setFontSize] = useState(16)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(initialAnalysisData)
    const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleResult | null>(null)
    const [selectedTab, setSelectedTab] = useState<string>('overview')
    const [showTranscript, setShowTranscript] = useState(true)
    const [isLoading, setIsLoading] = useState(initialIsLoading)
    const url = process.env.NEXT_PUBLIC_API_URL
    const playerRef = useRef<HTMLIFrameElement | null>(null)

    useEffect(() => {
        setAnalysisData(initialAnalysisData)
        setIsLoading(initialIsLoading)

        // 첫 번째 자막 자동 선택
        if (initialAnalysisData?.subtitleResults && initialAnalysisData.subtitleResults.length > 0) {
            setSelectedSubtitle(initialAnalysisData.subtitleResults[0])
        }
    }, [initialAnalysisData, initialIsLoading])

    // 탭 변경 시 트랜스크립트 표시 여부 연동
    useEffect(() => {
        if (selectedTab === '단어' || selectedTab === '표현') {
            setShowTranscript(false)
        } else if (selectedTab === 'overview') {
            setShowTranscript(true)
        }
    }, [selectedTab])

    // 스크립트 클릭 시 유튜브 플레이어 시간 이동
    const handleSubtitleClick = (time: string, subtitle: SubtitleResult) => {
        setSelectedSubtitle(subtitle)

        const seconds = parseTimeToSeconds(time)
        if (playerRef.current) {
            playerRef.current.contentWindow?.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: 'seekTo',
                    args: [seconds, true],
                }),
                '*',
            )
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <button onClick={onBack} className="text-[var(--color-main)] font-semibold w-full h-2 text-right">
                &larr; 목록으로
            </button>

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                {/* 비디오 + 트랜스크립트 */}
                <div className="flex flex-row gap-4 w-full h-[calc(100%-210px)]">
                    <div className="w-full aspect-video bg-gray-300 rounded-sm overflow-hidden">
                        <iframe
                            ref={playerRef}
                            src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                    <VideoScript
                        analysisData={analysisData}
                        onSubtitleClick={handleSubtitleClick}
                        showTranscript={showTranscript}
                        setShowTranscript={setShowTranscript}
                        isLoading={isLoading}
                    />
                </div>

                {/* 제목 + 부가기능 */}
                <div className="flex justify-between items-center w-full h-20">
                    <h3 className="flex-1">{video.title}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFontSize((prev) => Math.max(12, prev - 4))}>
                            <Image src="/assets/minus.svg" alt="video" width={24} height={24} />
                        </button>

                        <Image src="/assets/font-size.svg" alt="video" width={24} height={24} />
                        <span className="text-sm font-bold">{fontSize}px</span>
                        <button onClick={() => setFontSize((prev) => Math.min(40, prev + 4))}>
                            <Image src="/assets/plus.svg" alt="video" width={24} height={24} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[var(--color-main)] text-white px-4 py-2 rounded-md ml-4"
                    >
                        추가
                    </button>
                </div>

                {/* 하단 탭 메뉴 */}
                <VideoTab
                    fontSize={fontSize}
                    selectedSubtitle={
                        selectedSubtitle && {
                            original: selectedSubtitle.original,
                            transcript: selectedSubtitle.transcript,
                            keywords: selectedSubtitle.keywords,
                        }
                    }
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    isLoading={isLoading}
                />
            </div>

            {/* 모달 */}
            {isModalOpen && (
                <WordModal
                    title="이 영상을 단어장에 추가할까요?"
                    description={`"${video.title}"`}
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={() => {
                        // 추가 로직 위치
                        setIsModalOpen(false)
                    }}
                    confirmText="추가하기"
                    cancelText="닫기"
                />
            )}
        </div>
    )
}

export default VideoLearning
