'use client'

import { useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'
import DashboardLayout from '../../dashboardLayout'
import VideoIcon from '@/components/icon/videoIcon'
import VideoLearning from '@/components/video/videoLearning'

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

function VideoLearningPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter()
    const { videoId } = use(params)
    const url = process.env.NEXT_PUBLIC_API_URL
    const [videoData, setVideoData] = useState({
        videoId: videoId,
        title: '비디오 제목',
        description: '비디오 설명',
        thumbnail: undefined,
    })
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 비디오 상세 정보 요청 및 분석 데이터 요청
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // 영상 정보 저장 후 분석 요청
                const detailResponse = await fetch(`${url}/api/v1/video/${videoId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                const detailData = await detailResponse.json()
                console.log('비디오 상세 정보:', detailData)

                if (!detailResponse.ok) {
                    throw new Error('비디오 상세 정보를 불러오는데 실패했습니다.')
                }

                setVideoData(detailData.data)

                const analysisResponse = await fetch(`${url}/api/v1/video/${videoId}/analysis`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                const analysisResult = await analysisResponse.json()
                console.log('비디오 분석 데이터:', analysisResult)

                setAnalysisData(analysisResult.data)
            } catch (error) {
                console.error('데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [videoId, url])

    const handleBack = () => {
        router.push('/video')
    }

    return (
        <DashboardLayout title="Video Learning" icon={<VideoIcon />}>
            <VideoLearning video={videoData} analysisData={analysisData} onBack={handleBack} isLoading={isLoading} />
        </DashboardLayout>
    )
}

export default VideoLearningPage
