'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnalysisData, SubtitleResult } from '@/types/video'

interface Props {
    analysisData: AnalysisData | null
    onSubtitleClick?: (startTime: string, subtitle: SubtitleResult) => void
    showTranscript: boolean
    setShowTranscript: (show: boolean) => void
    isLoading: boolean
    currentTime?: number
    selectedSubtitle?: SubtitleResult | null
}

function VideoScript({
    analysisData,
    onSubtitleClick,
    showTranscript,
    setShowTranscript,
    isLoading,
    currentTime = 0,
    selectedSubtitle: externalSelectedSubtitle,
}: Props) {
    const [selectedIdx, setSelectedIdx] = useState(0)

    // 외부에서 선택된 자막이 변경되면 인덱스 업데이트
    useEffect(() => {
        if (externalSelectedSubtitle && analysisData?.subtitleResults) {
            const index = analysisData.subtitleResults.findIndex((subtitle) => subtitle === externalSelectedSubtitle)
            if (index !== -1) {
                setSelectedIdx(index)
            }
        }
    }, [externalSelectedSubtitle, analysisData])

    // 현재 시간에 맞는 자막 찾기 (중복 체크용)
    const getCurrentSubtitleIdx = () => {
        if (!analysisData?.subtitleResults || !analysisData.subtitleResults.length) return -1

        const subtitles = analysisData.subtitleResults
        for (let i = 0; i < subtitles.length; i++) {
            const subtitle = subtitles[i]
            const nextSubtitle = subtitles[i + 1]

            if (!subtitle.startTime) continue

            const startSeconds = parseTimeToSeconds(subtitle.startTime)
            const endSeconds = nextSubtitle?.startTime ? parseTimeToSeconds(nextSubtitle.startTime) : startSeconds + 10 // 마지막 자막은 10초 지속으로 가정

            if (currentTime >= startSeconds && currentTime < endSeconds) {
                return i
            }
        }

        return -1
    }

    // 타임스탬프 문자열을 초 단위로 변환
    const parseTimeToSeconds = (time: string) => {
        const [h, m, s] = time.split(':')
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
    }

    // 현재 재생 시간에 맞는 자막 자동 선택 (인덱스만 업데이트)
    useEffect(() => {
        const currentIdx = getCurrentSubtitleIdx()
        if (currentIdx !== -1 && currentIdx !== selectedIdx) {
            setSelectedIdx(currentIdx)
        }
    }, [currentTime])

    return (
        <div className="w-full flex flex-col gap-2 rounded-lg bg-[var(--color-white)] p-4 h-full">
            {/* 스크립트 내용 */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold w-full">📄 Transcript</h2>
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-[var(--color-main)] font-semibold w-full text-right"
                >
                    {showTranscript ? '숨기기' : '보이기'}
                </button>
            </div>

            <div className="flex-grow flex w-full rounded-lg p-2 flex-col gap-2 bg-[var(--color-sub-2)] overflow-hidden overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500 bg-[var(--color-white)]">
                        <Image src="/character/loading-2.gif" alt="loading" width={300} height={300} />
                    </div>
                ) : showTranscript && analysisData?.subtitleResults?.length ? (
                    <ul className="list-disc pl-8 space-y-2">
                        {analysisData.subtitleResults.map((subtitle, idx) => (
                            <li
                                key={idx}
                                onClick={() => {
                                    setSelectedIdx(idx)
                                    // 자막 시작 시간이 있을 때만 클릭 핸들러 호출
                                    if (subtitle.startTime) {
                                        onSubtitleClick?.(subtitle.startTime, subtitle)
                                    }
                                }}
                                className={
                                    selectedIdx === idx
                                        ? 'w-full font-bold bg-lime-200 text-black rounded px-1 py-1 cursor-pointer -ml-1'
                                        : 'w-full text-gray-400 cursor-pointer py-1 -ml-1'
                                }
                                ref={
                                    selectedIdx === idx
                                        ? (el) => {
                                              // 선택된 자막으로 스크롤
                                              if (el) {
                                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                              }
                                          }
                                        : undefined
                                }
                            >
                                {subtitle.original}
                            </li>
                        ))}
                    </ul>
                ) : !showTranscript ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        스크립트 내용이 숨겨집니다.
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        사용 가능한 자막이 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}

export default VideoScript
