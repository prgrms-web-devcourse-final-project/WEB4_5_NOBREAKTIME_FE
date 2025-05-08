'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import VideoTab from './videoTab'
import VideoScript from './videoScript'
import WordModal from './wordModal'
import Image from 'next/image'
import { VideoData, AnalysisData, SubtitleResult } from '@/types/video'

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
    const [currentTime, setCurrentTime] = useState(0)
    const url = process.env.NEXT_PUBLIC_API_URL
    const playerRef = useRef<HTMLIFrameElement | null>(null)
    const playerStateRef = useRef<any>(null)

    useEffect(() => {
        setAnalysisData(initialAnalysisData)
        setIsLoading(initialIsLoading)

        // 첫 번째 자막 자동 선택
        if (initialAnalysisData?.subtitleResults && initialAnalysisData.subtitleResults.length > 0) {
            setSelectedSubtitle(initialAnalysisData.subtitleResults[0])
        }
    }, [initialAnalysisData, initialIsLoading])

    // YouTube Player API 초기화
    useEffect(() => {
        // YouTube API 로드
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        // YouTube Player 이벤트 처리
        const onYouTubeIframeAPIReady = () => {
            if (!playerStateRef.current && playerRef.current) {
                playerStateRef.current = new (window as any).YT.Player(playerRef.current, {
                    events: {
                        onStateChange: onPlayerStateChange,
                        onReady: onPlayerReady,
                    },
                })
            }
        }

        // API가 로드되면 초기화
        if ((window as any).YT && (window as any).YT.Player) {
            onYouTubeIframeAPIReady()
        } else {
            ;(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
        }

        return () => {
            // 컴포넌트 언마운트 시 타이머 정리
            if (playerStateRef.current) {
                clearInterval(playerStateRef.current.timeUpdateInterval)
            }
        }
    }, [video.videoId])

    // 플레이어 준비 완료 시 호출
    const onPlayerReady = () => {
        // 1초마다 현재 재생 시간 업데이트
        playerStateRef.current.timeUpdateInterval = setInterval(() => {
            if (playerStateRef.current && playerStateRef.current.getCurrentTime) {
                const currentTime = playerStateRef.current.getCurrentTime()
                setCurrentTime(currentTime)
                updateCurrentSubtitle(currentTime)
            }
        }, 1000)
    }

    // 플레이어 상태 변경 시 호출
    const onPlayerStateChange = (event: any) => {
        // 재생 중일 때만 시간 업데이트
        if (event.data === 1) {
            // YT.PlayerState.PLAYING
            if (!playerStateRef.current.timeUpdateInterval) {
                playerStateRef.current.timeUpdateInterval = setInterval(() => {
                    if (playerStateRef.current && playerStateRef.current.getCurrentTime) {
                        const currentTime = playerStateRef.current.getCurrentTime()
                        setCurrentTime(currentTime)
                        updateCurrentSubtitle(currentTime)
                    }
                }, 1000)
            }
        } else if (event.data === 0) {
            // YT.PlayerState.ENDED - 영상이 끝났을 때
            clearInterval(playerStateRef.current.timeUpdateInterval)
            playerStateRef.current.timeUpdateInterval = null
            // 영상이 끝나면 모달 열기
            setIsModalOpen(true)
        } else {
            // 일시정지, 정지 등의 상태일 때 타이머 정리
            clearInterval(playerStateRef.current.timeUpdateInterval)
            playerStateRef.current.timeUpdateInterval = null
        }
    }

    // 현재 시간에 맞는 자막 업데이트
    const updateCurrentSubtitle = useCallback(
        (currentTime: number) => {
            const subtitles = analysisData?.subtitleResults
            if (!subtitles || subtitles.length === 0) return

            // 현재 시간에 해당하는 자막 찾기
            const currentSubtitle = subtitles.find((subtitle, index) => {
                const startTime = parseTimeToSeconds(subtitle.startTime || '0:0:0')
                const endTime = parseTimeToSeconds(subtitle.endTime || '0:0:0')

                // 마지막 자막인 경우 특별 처리
                if (index === subtitles.length - 1) {
                    return currentTime >= startTime
                }

                return currentTime >= startTime && currentTime < endTime
            })

            if (currentSubtitle && currentSubtitle !== selectedSubtitle) {
                setSelectedSubtitle(currentSubtitle)
            }
        },
        [analysisData?.subtitleResults, selectedSubtitle],
    )

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
        if (playerRef.current && playerStateRef.current) {
            playerStateRef.current.seekTo(seconds, true)
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
                            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?enablejsapi=1&rel=0&modestbranding=1`}
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
                        currentTime={currentTime}
                        selectedSubtitle={selectedSubtitle}
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
                            original: selectedSubtitle.original || '',
                            transcript: selectedSubtitle.transcript || '',
                            keywords: selectedSubtitle.keywords,
                        }
                    }
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    isLoading={isLoading}
                    videoId={video.videoId || ''}
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
