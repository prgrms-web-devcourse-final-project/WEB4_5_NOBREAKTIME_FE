'use client'

import { components } from '@/lib/backend/apiV1/schema'
import VideoIcon from '@/components/icon/videoIcon'
import VideoLearning from '@/components/video/videoLearning'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

type VideoResponse = components['schemas']['VideoResponse']
// 비디오 분석 데이터 타입(SSE 형식으로 openapi-fetch 사용불가)
type AnalyzeVideoResponse = {
    subtitleResults: {
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
    }[]
}

// 분석 진행 상태 타입
type AnalysisStatus = {
    stage: 'idle' | 'lockAcquired' | 'audioExtracted' | 'sttCompleted' | 'analysisComplete' | 'lockChecking'
    message: string
    progress: number
}

function VideoLearningPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter()
    const { videoId } = use(params)
    const url = process.env.NEXT_PUBLIC_API_URL
    const [videoData, setVideoData] = useState<VideoResponse | null>(null)
    const [analysisData, setAnalysisData] = useState<AnalyzeVideoResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
        stage: 'idle',
        message: '분석 준비중...',
        progress: 0,
    })

    // 이벤트에 따른 상태 업데이트 함수
    const updateAnalysisStatus = (event: string, message?: string) => {
        const statusMap: Record<string, Partial<AnalysisStatus>> = {
            lockAcquired: {
                stage: 'lockAcquired',
                message: '영상 분석을 진행 중 입니다.',
                progress: 0,
            },
            audioExtracted: {
                stage: 'audioExtracted',
                message: '음성 추출을 진행 중이에요!!',
                progress: 5,
            },
            sttCompleted: {
                stage: 'sttCompleted',
                message: '자막을 생성하는 중이에요!!',
                progress: 15,
            },
            analysisComplete: {
                stage: 'analysisComplete',
                message: '얼마 안남았어요! 자막을 분석하는 중이에요~!!',
                progress: 100,
            },
            lockChecking: {
                stage: 'lockChecking',
                message: message || '영상의 분석이 진행중입니다...',
                progress: 0,
            },
        }

        const newStatus = statusMap[event]
        if (newStatus) {
            setAnalysisStatus((prev) => ({ ...prev, ...newStatus }))
        }
    }

    // 비디오 상세 정보 요청 및 분석 데이터 요청
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // 쿼리 스트링에서 title만 가져오기
                const urlParams = new URLSearchParams(window.location.search)
                const title = urlParams.get('title')

                // URL 파라미터에서 비디오 정보 설정
                setVideoData({
                    videoId,
                    title: title || '비디오 제목',
                    description: '',
                    thumbnailUrl: undefined,
                    bookmarked: false,
                })

                // SSE로 비디오 분석 데이터 요청
                const response = await fetch(`${url}/api/v1/videos/${videoId}/analysis`, {
                    credentials: 'include',
                })

                if (!response.ok) {
                    throw new Error('비디오 분석 데이터를 불러오는데 실패했습니다.')
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('스트림 리더를 생성할 수 없습니다.')
                }

                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        // 이벤트 라인 처리
                        if (line.startsWith('event:')) {
                            const event = line.slice(6).trim()
                            updateAnalysisStatus(event)
                            continue
                        }

                        // 데이터 라인 처리
                        if (line.startsWith('data:')) {
                            const content = line.slice(5).trim()

                            // 일반 메시지인 경우 상태 메시지 업데이트
                            if (!content.startsWith('{')) {
                                const currentEvent = analysisStatus.stage
                                updateAnalysisStatus(currentEvent, content)
                                continue
                            }

                            try {
                                // JSON 데이터 처리
                                const data = JSON.parse(content)
                                if (data.subtitleResults) {
                                    setAnalysisData(data)
                                }
                            } catch (e) {
                                console.error('SSE 데이터 파싱 실패:', e)
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [videoId])

    const handleBack = () => {
        router.push('/dashboard/video/learning')
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <VideoIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Video Learning</h3>
            </div>
            <VideoLearning
                video={videoData || { videoId, title: '', description: '', thumbnailUrl: undefined, bookmarked: false }}
                analysisData={analysisData}
                onBack={handleBack}
                isLoading={isLoading}
                analysisStatus={analysisStatus}
            />
        </>
    )
}

export default VideoLearningPage
