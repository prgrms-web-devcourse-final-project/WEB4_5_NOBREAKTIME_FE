'use client'

import { useState, useEffect, useRef } from 'react'
import VideoTab from './videoTab'
import VideoScript from './videoScript'
import Image from 'next/image'
import { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { Keyword } from './videoTab/KeywordCard'

type VideoResponse = components['schemas']['VideoResponse']

type SubtitleResult = {
    subtitleId: number
    startTime?: string
    endTime?: string
    speaker?: string
    original?: string
    transcript?: string
    keywords?: {
        word: string
        meaning: string
        difficulty: number
    }[]
}

type AnalyzeVideoResponse = {
    subtitleResults: SubtitleResult[]
}

type AnalysisStatus = {
    stage: 'idle' | 'lockAcquired' | 'audioExtracted' | 'sttCompleted' | 'analysisComplete' | 'lockChecking'
    message: string
    progress: number
}

interface Props {
    video: VideoResponse
    analysisData: AnalyzeVideoResponse | null
    onBack: () => void
    isLoading: boolean
    analysisStatus: AnalysisStatus
}

function parseTimeToSeconds(time: string) {
    const [h, m, s] = time.split(':')
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
}

function VideoLearning({
    video,
    analysisData: initialAnalysisData,
    onBack,
    isLoading: initialIsLoading,
    analysisStatus,
}: Props) {
    const [fontSize, setFontSize] = useState(16)
    const [analysisData, setAnalysisData] = useState<AnalyzeVideoResponse | null>(initialAnalysisData)
    const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleResult | null>(null)
    const [selectedTab, setSelectedTab] = useState<string>('overview')
    const [showTranscript, setShowTranscript] = useState(true)
    const [isLoading, setIsLoading] = useState(initialIsLoading)
    const [currentTime, setCurrentTime] = useState(0)
    const playerRef = useRef<HTMLIFrameElement | null>(null)
    const playerStateRef = useRef<any>(null)

    // 비디오 데이터 로드
    useEffect(() => {
        setAnalysisData(initialAnalysisData)
        setIsLoading(initialIsLoading)

        // 첫 번째 자막 자동 선택
        if (initialAnalysisData?.subtitleResults && initialAnalysisData.subtitleResults.length > 0) {
            setSelectedSubtitle(initialAnalysisData.subtitleResults[0])
        }
    }, [initialAnalysisData, initialIsLoading])

    // 현재 시간에 따라 자막 자동 선택
    useEffect(() => {
        if (!analysisData?.subtitleResults || analysisData.subtitleResults.length === 0) return

        // 현재 시간에 해당하는 자막 찾기
        const findSubtitleForCurrentTime = () => {
            const subtitles = analysisData.subtitleResults || []
            for (let i = 0; i < subtitles.length; i++) {
                const subtitle = subtitles[i]
                const nextSubtitle = subtitles[i + 1]

                if (!subtitle.startTime) continue

                const startSeconds = parseTimeToSeconds(subtitle.startTime)
                const endSeconds = nextSubtitle?.startTime
                    ? parseTimeToSeconds(nextSubtitle.startTime)
                    : startSeconds + 10 // 마지막 자막은 10초 지속으로 가정

                if (currentTime >= startSeconds && currentTime < endSeconds) {
                    return subtitle
                }
            }

            return null
        }

        const matchingSubtitle = findSubtitleForCurrentTime()
        if (matchingSubtitle && matchingSubtitle !== selectedSubtitle) {
            setSelectedSubtitle(matchingSubtitle)
        }
    }, [currentTime, analysisData, selectedSubtitle])

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
        // 1초마다 현재 재생 시간만 업데이트
        playerStateRef.current.timeUpdateInterval = setInterval(() => {
            if (playerStateRef.current && playerStateRef.current.getCurrentTime) {
                const currentTime = playerStateRef.current.getCurrentTime()
                setCurrentTime(currentTime)
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
                    }
                }, 1000)
            }
        } else if (event.data === 0) {
            // YT.PlayerState.ENDED - 영상이 끝났을 때
            clearInterval(playerStateRef.current.timeUpdateInterval)
            playerStateRef.current.timeUpdateInterval = null

            // 단어 탭으로 이동
            setSelectedTab('단어')

            // 영상이 끝났을 때 메시지 표시
            alert('영상 시청이 완료되었습니다. 단어 탭에서 학습한 내용을 테스트해보세요!')
        } else {
            // 일시정지, 정지 등의 상태일 때 타이머 정리
            clearInterval(playerStateRef.current.timeUpdateInterval)
            playerStateRef.current.timeUpdateInterval = null
        }
    }

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
        // 선택된 자막 설정
        setSelectedSubtitle(subtitle)

        // 시간으로 변환
        const seconds = parseTimeToSeconds(time)

        // 플레이어 시간 이동
        if (playerRef.current && playerStateRef.current) {
            playerStateRef.current.seekTo(seconds, true)

            // 현재 시간도 함께 업데이트 (즉시 UI 반영을 위함)
            setCurrentTime(seconds)
        }
    }

    // 현재 선택된 자막의 인덱스 계산
    const currentSubtitleIndex =
        analysisData?.subtitleResults?.findIndex(
            (subtitle: SubtitleResult) => subtitle.original === selectedSubtitle?.original,
        ) ?? 0

    // 이전 자막으로 이동
    const handlePrevSubtitle = () => {
        if (!analysisData?.subtitleResults || currentSubtitleIndex <= 0) return
        const prevSubtitle = analysisData.subtitleResults[currentSubtitleIndex - 1]
        setSelectedSubtitle(prevSubtitle)
        if (prevSubtitle.startTime) {
            const seconds = parseTimeToSeconds(prevSubtitle.startTime)
            if (playerRef.current && playerStateRef.current) {
                playerStateRef.current.seekTo(seconds, true)
                setCurrentTime(seconds)
            }
        }
    }

    // 다음 자막으로 이동
    const handleNextSubtitle = () => {
        if (!analysisData?.subtitleResults || currentSubtitleIndex >= analysisData.subtitleResults.length - 1) return
        const nextSubtitle = analysisData.subtitleResults[currentSubtitleIndex + 1]
        setSelectedSubtitle(nextSubtitle)
        if (nextSubtitle.startTime) {
            const seconds = parseTimeToSeconds(nextSubtitle.startTime)
            if (playerRef.current && playerStateRef.current) {
                playerStateRef.current.seekTo(seconds, true)
                setCurrentTime(seconds)
            }
        }
    }

    // VideoTab에 전달할 props
    const videoTabProps = {
        fontSize,
        selectedSubtitle: selectedSubtitle && {
            original: selectedSubtitle.original || '',
            transcript: selectedSubtitle.transcript || '',
            keywords: selectedSubtitle.keywords || [],
            subtitleId: selectedSubtitle.subtitleId,
        },
        selectedTab,
        onTabChange: setSelectedTab,
        isLoading,
        videoId: video.videoId || '',
        currentTime,
        subtitleIndex: currentSubtitleIndex,
        onPrevSubtitle: handlePrevSubtitle,
        onNextSubtitle: handleNextSubtitle,
    }

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-170px)]">
            <button onClick={onBack} className="text-[var(--color-main)] font-semibold w-full h-2 text-right">
                &larr; 목록으로
            </button>

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                {/* 비디오 + 트랜스크립트 */}
                <div className="flex flex-row gap-4 w-full h-[calc(100%-240px)]">
                    <div className="w-full aspect-video bg-gray-300 rounded-sm overflow-hidden relative">
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
                        analysisStatus={analysisStatus}
                    />
                </div>

                {/* 제목 + 부가기능 */}
                <div className="flex justify-between items-center w-full h-10">
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
                </div>

                {/* 하단 탭 메뉴 */}
                <VideoTab {...videoTabProps} />
            </div>
        </div>
    )
}

export default VideoLearning
