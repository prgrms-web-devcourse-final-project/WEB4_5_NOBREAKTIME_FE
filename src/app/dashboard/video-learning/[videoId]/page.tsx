'use client'

import DashboardLayout from '@/app/dashboardLayout'
import VideoIcon from '@/components/icon/videoIcon'
import VideoLearning from '@/components/video/videoLearning'
import client from '@/lib/backend/client'
import { AnalysisData, VideoData } from '@/types/video'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

function VideoLearningPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter()
    const { videoId } = use(params)
    const url = process.env.NEXT_PUBLIC_API_URL
    const [videoData, setVideoData] = useState<VideoData | null>(null)
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
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
                })

                const { data, error } = await client.GET('/api/v1/videos/{youtubeVideoId}/analysis', {
                    params: {
                        path: {
                            youtubeVideoId: videoId,
                        },
                    },
                })

                if (error) {
                    console.error('API 오류:', error)
                    throw new Error('비디오 분석 데이터를 불러오는데 실패했습니다.')
                }

                console.log('비디오 분석 데이터:', data)

                if (data?.data) {
                    setAnalysisData(data.data)
                }
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
            <VideoLearning
                video={videoData || { videoId, title: '', description: '', thumbnailUrl: undefined }}
                analysisData={analysisData}
                onBack={handleBack}
                isLoading={isLoading}
            />
        </DashboardLayout>
    )
}

export default VideoLearningPage
