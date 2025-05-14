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

function VideoLearningPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter()
    const { videoId } = use(params)
    const url = process.env.NEXT_PUBLIC_API_URL
    const [videoData, setVideoData] = useState<VideoResponse | null>(null)
    const [analysisData, setAnalysisData] = useState<AnalyzeVideoResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 비디오 상세 정보 요청 및 분석 데이터 요청
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // 쿼리 스트링에서 title과 description 가져오기
                const urlParams = new URLSearchParams(window.location.search)
                const title = urlParams.get('title')
                const description = urlParams.get('description')
                const thumbnail = urlParams.get('thumbnail')

                // URL 파라미터에서 비디오 정보 설정
                setVideoData({
                    videoId,
                    title: title || '비디오 제목',
                    description: description || '비디오 설명',
                    thumbnailUrl: thumbnail || undefined,
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
                        if (line.startsWith('data:')) {
                            try {
                                // 일반 텍스트 메시지 무시
                                const content = line.slice(5).trim()
                                if (content.startsWith('{')) {
                                    // JSON 형식인 경우에만 파싱
                                    const data = JSON.parse(content)
                                    console.log('받은 분석 데이터:', data) // 전체 데이터 로깅

                                    // data.data 대신 data를 직접 사용
                                    if (data.subtitleResults) {
                                        console.log('자막 데이터:', data.subtitleResults) // 자막 데이터 로깅
                                        setAnalysisData(data)
                                    }
                                } else {
                                    console.log('SSE 메시지:', content) // 일반 텍스트 메시지는 로그로만 출력
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
            />
        </>
    )
}

export default VideoLearningPage
