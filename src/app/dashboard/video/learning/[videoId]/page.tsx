'use client'

import VideoIcon from '@/components/icon/videoIcon'
import VideoLearning from '@/components/video/videoLearning'
import { AnalysisData, QuizData, VideoData } from '@/types/video'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import client from '@/lib/backend/client'

function VideoLearningPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter()
    const { videoId } = use(params)
    const [videoData, setVideoData] = useState<VideoData | null>(null)
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
    const [quizData, setQuizData] = useState<QuizData | null>(null)
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

                if (data?.data?.subtitleResults) {
                    setAnalysisData({
                        subtitleResults: data.data.subtitleResults.map((result: any) => ({
                            subtitleId: result.subtitleId || 0,
                            startTime: result.startTime || '',
                            endTime: result.endTime || '',
                            speaker: result.speaker || '',
                            original: result.original || '',
                            transcript: result.transcript || '',
                            keywords: (result.keywords || []).map((keyword: any) => ({
                                word: keyword.word || '',
                                meaning: keyword.meaning || '',
                                difficulty: keyword.difficulty || 1,
                            })),
                        })),
                    })

                    // 영상 분석이 성공적으로 완료되면 단어 퀴즈 조회
                    try {
                        const { data: quizResponse } = await client.GET('/api/v1/videos/{videoId}/quiz/words', {
                            params: {
                                path: {
                                    videoId: videoId,
                                },
                            },
                        })

                        if (quizResponse?.data?.quiz) {
                            setQuizData({
                                words: quizResponse.data.quiz.map((word: any) => ({
                                    word: word.word || '',
                                    pos: word.pos || '',
                                    meaning: word.meaning || '',
                                    difficulty: word.difficulty || 'EASY',
                                    exampleSentence: word.sentence || '',
                                    translatedSentence: word.sentenceMeaning || '',
                                })),
                            })
                            console.log('단어 퀴즈 데이터:', quizResponse.data)
                        }
                    } catch (quizError) {
                        console.error('단어 퀴즈 데이터를 가져오는데 실패했습니다:', quizError)
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
                video={videoData || { videoId, title: '', description: '', thumbnailUrl: undefined }}
                analysisData={analysisData}
                quizData={quizData}
                onBack={handleBack}
                isLoading={isLoading}
            />
        </>
    )
}

export default VideoLearningPage
