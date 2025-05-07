'use client'

import React, { useState } from 'react'

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
    analysisData: AnalysisData | null
    onSubtitleClick?: (startTime: string, subtitle: SubtitleResult) => void
    showTranscript: boolean
    setShowTranscript: (show: boolean) => void
    isLoading: boolean
}

function VideoScript({ analysisData, onSubtitleClick, showTranscript, setShowTranscript, isLoading }: Props) {
    const [selectedIdx, setSelectedIdx] = useState(0)

    return (
        <div className="w-300 flex flex-col gap-2 rounded-lg bg-[var(--color-white)] p-4">
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

            <div className="flex w-full h-90 rounded-lg p-2 flex-col gap-2 bg-[var(--color-sub-2)] overflow-hidden overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="animate-pulse">로딩 중...</div>
                    </div>
                ) : showTranscript && analysisData?.subtitleResults?.length ? (
                    <ul className="list-disc pl-8 space-y-2">
                        {analysisData.subtitleResults.map((subtitle, idx) => (
                            <li
                                key={idx}
                                onClick={() => {
                                    setSelectedIdx(idx)
                                    onSubtitleClick?.(subtitle.startTime, subtitle)
                                }}
                                className={
                                    selectedIdx === idx
                                        ? 'w-full font-bold bg-lime-200 text-black rounded px-1 py-1 cursor-pointer -ml-1'
                                        : 'w-full text-gray-400 cursor-pointer py-1 -ml-1'
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
