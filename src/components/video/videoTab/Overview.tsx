'use client'

import React, { useState, useEffect } from 'react'
import KeywordCard, { Keyword } from './KeywordCard'
import client from '@/lib/backend/client'

interface OverviewProps {
    fontSize: number
    selectedSubtitle?: {
        original: string
        transcript: string
        keywords?: Keyword[]
        subtitleId?: number
    } | null
    onAddKeyword?: (keyword: Keyword) => void
    onRemoveKeyword?: (keyword: Keyword) => void
    isKeywordAdded?: (keyword: Keyword) => boolean
    videoId?: string
    currentTime?: number
}

const Overview: React.FC<OverviewProps> = ({
    fontSize,
    selectedSubtitle,
    onAddKeyword,
    onRemoveKeyword,
    isKeywordAdded,
    videoId,
    currentTime = 0,
}) => {
    const [hoveredKeyword, setHoveredKeyword] = useState<Keyword | null>(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
    const [expressionBooks, setExpressionBooks] = useState<{ id: number; name: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // 표현함 목록 가져오기
    useEffect(() => {
        const fetchExpressionBooks = async () => {
            try {
                const { data, error } = await client.GET('/api/v1/expressionbooks', {})

                if (error) {
                    console.error('표현함 목록 조회 실패:', error)
                    return
                }

                if (data?.data) {
                    // 타입 안전하게 처리
                    const books = data.data.map((book) => ({
                        id: book.id || 0,
                        name: book.name || '기본 표현함',
                    }))
                    setExpressionBooks(books)
                }
            } catch (error) {
                console.error('표현함 목록 조회 오류:', error)
            }
        }

        fetchExpressionBooks()
    }, [])

    // 텍스트에서 키워드를 찾아 span 태그로 감싸는 함수
    const highlightKeywords = (text: string, keywords: Keyword[] = []) => {
        if (!keywords.length) return text

        const sortedKeywords = [...keywords].sort((a, b) => (b.word?.length || 0) - (a.word?.length || 0))

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

    // 키워드 추가 처리
    const handleAddKeyword = (keyword: Keyword) => {
        if (onAddKeyword) {
            onAddKeyword(keyword)
        }
        // 팝업을 닫지 않고 유지
    }

    // 키워드 제거 처리
    const handleRemoveKeyword = (keyword: Keyword) => {
        if (onRemoveKeyword) {
            onRemoveKeyword(keyword)
        }
        // 팝업을 닫지 않고 유지
    }

    // 키워드가 이미 추가되었는지 확인
    const checkIsAdded = (keyword: Keyword) => {
        return isKeywordAdded ? isKeywordAdded(keyword) : false
    }

    // 표현 추가 처리
    const handleAddExpression = async () => {
        if (!selectedSubtitle || !videoId) {
            alert('선택된 자막이 없거나 비디오 정보가 없습니다.')
            return
        }

        setIsLoading(true)
        try {
            // 표현함이 없으면 기본 표현함 사용
            if (expressionBooks.length === 0) {
                alert('표현함이 없습니다. 표현함을 먼저 생성해주세요.')
                setIsLoading(false)
                return
            }

            // 첫 번째 표현함에 저장 (기본 표현함)
            const expressionBookId = expressionBooks[0].id
            const { data, error } = await client.POST(`/api/v1/expressionbooks/{expressionBookId}/expressions`, {
                params: {
                    path: {
                        expressionBookId,
                    },
                },
                body: {
                    videoId: videoId,
                    subtitleId: selectedSubtitle.subtitleId || 0,
                },
            })

            if (error) {
                console.error('표현 저장 실패:', error)
                alert('표현 저장에 실패했습니다.')
                return
            }

            alert(`"${expressionBooks[0].name}" 표현함에 표현이 추가되었습니다.`)
        } catch (error) {
            console.error('표현 저장 오류:', error)
            alert('표현 저장 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!selectedSubtitle) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ fontSize: `${fontSize}px` }}>
                <div className="text-gray-500">선택된 자막이 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="w-full h-full relative flex flex-col" style={{ fontSize: `${fontSize}px` }}>
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-4 mt-2">
                    <div
                        className="font-bold"
                        dangerouslySetInnerHTML={{
                            __html: highlightKeywords(selectedSubtitle.original, selectedSubtitle.keywords),
                        }}
                        onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (target.tagName === 'SPAN' && target.dataset.keyword) {
                                const keyword = selectedSubtitle.keywords?.find(
                                    (k) => k.word?.toLowerCase() === target.dataset.keyword?.toLowerCase(),
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
                                    (k) => k.word?.toLowerCase() === target.dataset.keyword?.toLowerCase(),
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
                </div>

                {/* 🔹 표현 버튼 */}
                <button
                    className="w-fit px-4 py-1 rounded bg-[var(--color-main)] text-white font-medium hover:bg-purple-700 mt-6"
                    onClick={handleAddExpression}
                    disabled={isLoading}
                >
                    {isLoading ? '저장 중...' : '표현 추가'}
                </button>
            </div>

            {/* 호버 시 나타나는 카드 */}
            {hoveredKeyword && (
                <KeywordCard
                    keyword={hoveredKeyword}
                    position={hoverPosition}
                    onClose={() => setHoveredKeyword(null)}
                    onAddWord={handleAddKeyword}
                    onRemoveWord={handleRemoveKeyword}
                    isAdded={checkIsAdded(hoveredKeyword)}
                />
            )}
        </div>
    )
}

export default Overview
