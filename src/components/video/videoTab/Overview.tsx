'use client'

import React, { useState } from 'react'
import KeywordCard, { Keyword } from './KeywordCard'

interface OverviewProps {
    fontSize: number
    selectedSubtitle?: {
        original: string
        transcript: string
        keywords?: Keyword[]
    } | null
}

const Overview: React.FC<OverviewProps> = ({ fontSize, selectedSubtitle }) => {
    const [hoveredKeyword, setHoveredKeyword] = useState<Keyword | null>(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

    // 텍스트에서 키워드를 찾아 span 태그로 감싸는 함수
    const highlightKeywords = (text: string, keywords: Keyword[] = []) => {
        if (!keywords.length) return text

        const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length)

        let result = text

        sortedKeywords.forEach((keyword) => {
            const regex = new RegExp(`\\b${keyword.word}\\b`, 'gi')
            result = result.replace(
                regex,
                `<span class="relative inline-block text-purple-800 font-bold cursor-help" data-keyword="${keyword.word}">$&</span>`,
            )
        })

        return result
    }

    if (!selectedSubtitle) {
        return (
            <div className="w-full h-full" style={{ fontSize: `${fontSize}px` }}>
                <div className="flex items-center justify-center h-full text-gray-500">선택된 자막이 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="w-full h-full" style={{ fontSize: `${fontSize}px` }}>
            <div
                className="font-bold mb-2"
                dangerouslySetInnerHTML={{
                    __html: highlightKeywords(selectedSubtitle.original, selectedSubtitle.keywords),
                }}
                onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.tagName === 'SPAN' && target.dataset.keyword) {
                        const keyword = selectedSubtitle.keywords?.find(
                            (k) => k.word.toLowerCase() === target.dataset.keyword?.toLowerCase(),
                        )
                        if (keyword) {
                            const rect = target.getBoundingClientRect()
                            setHoverPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.bottom,
                            })
                            setHoveredKeyword(hoveredKeyword === keyword ? null : keyword)
                        }
                    }
                }}
                onMouseOver={(e) => {
                    const target = e.target as HTMLElement
                    if (target.tagName === 'SPAN' && target.dataset.keyword) {
                        const keyword = selectedSubtitle.keywords?.find(
                            (k) => k.word.toLowerCase() === target.dataset.keyword?.toLowerCase(),
                        )
                        if (keyword) {
                            const rect = target.getBoundingClientRect()
                            setHoverPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.bottom,
                            })
                            setHoveredKeyword(keyword)
                        }
                    }
                }}
                onMouseOut={() => setHoveredKeyword(null)}
            />
            <div className="rounded-lg bg-[var(--color-sub-2)] p-2 text-[var(--color-main)]">
                {selectedSubtitle.transcript}
            </div>

            {/* 🔹 표현 버튼 */}
            <button
                className="mt-2 w-fit px-4 py-1 rounded bg-[var(--color-main)] text-white font-medium hover:bg-[var(--color-main-sub)]"
                onClick={() => alert('표현 추가')}
            >
                표현 추가
            </button>

            {/* 호버 시 나타나는 카드 */}
            {hoveredKeyword && (
                <KeywordCard
                    keyword={hoveredKeyword}
                    position={hoverPosition}
                    onClose={() => setHoveredKeyword(null)}
                />
            )}
        </div>
    )
}

export default Overview
