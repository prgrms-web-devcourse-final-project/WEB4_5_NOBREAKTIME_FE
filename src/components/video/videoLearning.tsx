'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import VideoTab from './videoTab'
import VideoScript from './videoScript'
import WordModal from './wordModal'
import Image from 'next/image'
import { VideoData, AnalysisData, SubtitleResult, WordQuizResult, WordQuizType } from '@/types/video'
import client from '@/lib/backend/client'
import { Keyword } from './videoTab/KeywordCard'

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
    const [quizResults, setQuizResults] = useState<WordQuizResult[]>([])
    const [wordQuizData, setWordQuizData] = useState<WordQuizType[]>([])
    const [wordQuizLoading, setWordQuizLoading] = useState(false)
    // 커스텀 단어 목록
    const [customWords, setCustomWords] = useState<{ word: string; description?: string; checked: boolean }[]>([])
    const url = process.env.NEXT_PUBLIC_API_URL
    const playerRef = useRef<HTMLIFrameElement | null>(null)
    const playerStateRef = useRef<any>(null)

    // 비디오 데이터 및 단어 퀴즈 데이터 로드
    useEffect(() => {
        setAnalysisData(initialAnalysisData)
        setIsLoading(initialIsLoading)

        // 첫 번째 자막 자동 선택
        if (initialAnalysisData?.subtitleResults && initialAnalysisData.subtitleResults.length > 0) {
            setSelectedSubtitle(initialAnalysisData.subtitleResults[0])
        }

        // 단어 퀴즈 데이터 로드
        const fetchWordQuiz = async () => {
            if (!video.videoId) return

            try {
                setWordQuizLoading(true)
                const { data, error } = await client.GET('/api/v1/videos/{videoId}/quiz/words', {
                    params: {
                        path: {
                            videoId: video.videoId,
                        },
                    },
                })

                if (error) {
                    console.error('단어 퀴즈 데이터 요청 실패:', error)
                    return
                }

                console.log('단어 퀴즈 데이터:', data)
                if (data?.data?.quiz) {
                    const quizData = data.data.quiz as WordQuizType[]
                    setWordQuizData(quizData)

                    // 결과 배열 초기화
                    const initialResults = quizData.map((quiz) => ({
                        word: quiz.word || '',
                        meaning: quiz.meaning,
                        isCorrect: false,
                    }))
                    setQuizResults(initialResults)
                }
            } catch (error) {
                console.error('단어 퀴즈 데이터 요청 실패:', error)
            } finally {
                setWordQuizLoading(false)
            }
        }

        fetchWordQuiz()
    }, [initialAnalysisData, initialIsLoading, video.videoId])

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

            // 영상이 끝나도 모달을 바로 열지 않음
            // setIsModalOpen(true)
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

    // 단어 퀴즈 결과 처리
    const handleQuizResults = (results: WordQuizResult[]) => {
        setQuizResults(results)

        // 모든 문제를 풀었는지 확인
        const allAnswered = results.every((result) => result.isCorrect !== undefined)

        // 최종 결과 확인 버튼을 클릭한 경우에만 모달 표시
        // 모든 문제가 풀렸고, 오답이 있는 경우에만 모달 표시
        if (allAnswered) {
            const hasIncorrect = results.some((result) => result.isCorrect === false)
            if (hasIncorrect) {
                setIsModalOpen(true)
            } else {
                // 모두 정답인 경우 축하 메시지
                alert('축하합니다! 모든 문제를 맞추셨습니다.')
            }
        }
    }

    // 키워드가 이미 추가되었는지 확인
    const isKeywordAdded = (keyword: Keyword) => {
        if (!keyword.word) return false

        // 커스텀 단어장에 추가된 단어인지 확인
        const isInCustomWords = customWords.some((w) => w.word.toLowerCase() === keyword.word?.toLowerCase())

        // 퀴즈 오답에 있는 단어인지 확인
        const isInQuizResults = quizResults.some(
            (result) => result.word.toLowerCase() === keyword.word?.toLowerCase() && result.isCorrect === false,
        )

        return isInCustomWords || isInQuizResults
    }

    // 키워드 추가 처리
    const handleAddKeyword = (keyword: Keyword) => {
        // 이미 추가된 단어인지 확인
        const exists = customWords.some((w) => w.word.toLowerCase() === keyword.word?.toLowerCase())

        if (!exists && keyword.word) {
            setCustomWords([
                ...customWords,
                {
                    word: keyword.word,
                    description: keyword.meaning || '', // undefined일 경우 빈 문자열로 처리
                    checked: true,
                },
            ])
        }
    }

    // 키워드 제거 처리
    const handleRemoveKeyword = (keyword: Keyword) => {
        if (!keyword.word) return

        // 커스텀 단어에서 제거
        setCustomWords(customWords.filter((w) => w.word.toLowerCase() !== keyword.word?.toLowerCase()))

        // 퀴즈 결과 단어라면 isCorrect를 true로 변경 (체크 해제)
        const updatedQuizResults = quizResults.map((result) => {
            if (result.word.toLowerCase() === keyword.word?.toLowerCase()) {
                return { ...result, isCorrect: true }
            }
            return result
        })

        if (JSON.stringify(updatedQuizResults) !== JSON.stringify(quizResults)) {
            setQuizResults(updatedQuizResults)
        }
    }

    // 모달에 전달할 단어 목록 (모든 단어 포함, 오답만 체크)
    const getWordsForModal = () => {
        // 퀴즈 결과에서 단어 목록 가져오기
        const quizWords = quizResults.map((result) => ({
            word: result.word,
            description: result.meaning || '', // undefined일 경우 빈 문자열로 처리
            // 오답인 경우만 체크하고, 정답이거나 아직 풀지 않은 문제는 체크 해제
            checked: result.isCorrect === false,
            isCorrect: result.isCorrect,
        }))

        // 커스텀 단어 목록과 합치기 (중복 제거)
        const allWords = [...quizWords]

        customWords.forEach((customWord) => {
            // 퀴즈에 이미 있는 단어가 아닌 경우만 추가
            if (!allWords.some((w) => w.word.toLowerCase() === customWord.word.toLowerCase())) {
                // 항상 description이 문자열인 새 객체를 만들어 추가
                allWords.push({
                    word: customWord.word,
                    description: customWord.description || '', // undefined인 경우 빈 문자열 사용
                    checked: customWord.checked,
                    isCorrect: false, // 커스텀 단어는 정답이 아님
                })
            }
        })

        console.log('모달에 전달할 단어 목록:', allWords)
        return allWords
    }

    // 단어 추가 버튼 클릭 시 처리
    const handleAddWordsClick = () => {
        const words = getWordsForModal()
        const checkedWords = words.filter((word) => word.checked)

        if (checkedWords.length > 0) {
            setIsModalOpen(true)
        } else {
            alert('추가할 단어가 없습니다. 단어 퀴즈에서 오답을 내거나 Overview에서 단어를 추가해주세요!')
        }
    }

    // VideoTab에 전달할 props
    const videoTabProps = {
        fontSize,
        selectedSubtitle: selectedSubtitle && {
            original: selectedSubtitle.original || '',
            transcript: selectedSubtitle.transcript || '',
            keywords: selectedSubtitle.keywords,
        },
        selectedTab,
        onTabChange: setSelectedTab,
        isLoading: isLoading || wordQuizLoading,
        videoId: video.videoId || '',
        onQuizResults: handleQuizResults,
        wordQuizData,
        onAddKeyword: handleAddKeyword,
        onRemoveKeyword: handleRemoveKeyword,
        isKeywordAdded,
        currentTime,
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <button onClick={onBack} className="text-[var(--color-main)] font-semibold w-full h-2 text-right">
                &larr; 목록으로
            </button>

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                {/* 비디오 + 트랜스크립트 */}
                <div className="flex flex-row gap-4 w-full h-[calc(100%-310px)]">
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

            {/* 모달 */}
            {isModalOpen && (
                <WordModal
                    title="단어를 단어장에 추가할까요?"
                    description={`"${video.title}"`}
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={async (selectedWords, selectedList) => {
                        try {
                            // 선택된 단어를 단어장에 추가
                            const wordsToAdd = selectedWords.map((word) => ({
                                word: word.word,
                                videoId: video.videoId,
                            }))

                            // 선택된 단어장 정보 찾기
                            let selectedWordbookName = '단어장'
                            const { data: wordbooksData } = await client.GET('/api/v1/wordbooks', {})

                            if (wordbooksData?.data) {
                                const wordbook = wordbooksData.data.find(
                                    (book: any) => book.id.toString() === selectedList,
                                )
                                if (wordbook && wordbook.name) {
                                    selectedWordbookName = wordbook.name
                                }
                            }

                            const { error } = await client.POST(`/api/v1/wordbooks/{wordbookId}/words`, {
                                params: {
                                    path: {
                                        wordbookId: parseInt(selectedList),
                                    },
                                },
                                body: {
                                    words: wordsToAdd,
                                },
                            })

                            if (error) {
                                console.error('단어 추가 실패:', error)
                                alert('단어 추가에 실패했습니다.')
                            } else {
                                alert(`${selectedWordbookName}에 ${selectedWords.length}개 단어가 추가되었습니다.`)
                            }
                        } catch (error) {
                            console.error('단어 추가 오류:', error)
                            alert('단어 추가에 실패했습니다.')
                        } finally {
                            setIsModalOpen(false)
                            // 모달을 닫은 후 커스텀 단어 초기화
                            setCustomWords([])
                        }
                    }}
                    confirmText="추가하기"
                    cancelText="닫기"
                    initialWords={getWordsForModal()}
                />
            )}
        </div>
    )
}

export default VideoLearning
