'use client'

import client from '@/lib/backend/client'
import React, { useEffect, useState } from 'react'
import KeywordCard, { Keyword } from './KeywordCard'

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
    onPrevSubtitle?: () => void
    onNextSubtitle?: () => void
    subtitleIndex?: number
}

const Overview: React.FC<OverviewProps> = ({
    fontSize,
    selectedSubtitle,
    onAddKeyword,
    onRemoveKeyword,
    isKeywordAdded,
    videoId,
    currentTime = 0,
    onPrevSubtitle,
    onNextSubtitle,
    subtitleIndex = 0,
}) => {
    const [hoveredKeyword, setHoveredKeyword] = useState<Keyword | null>(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
    const [expressionBooks, setExpressionBooks] = useState<{ id: number; name: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showTranscript, setShowTranscript] = useState(true)
    const [addedKeywords, setAddedKeywords] = useState<Keyword[]>([])
    const [showExpressionModal, setShowExpressionModal] = useState(false)
    const [selectedBookId, setSelectedBookId] = useState<number | null>(null)

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
                        id: book.expressionBookId || 0,
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

    // 모달이 열릴 때 첫 번째 표현함을 자동 선택
    useEffect(() => {
        if (showExpressionModal && expressionBooks.length > 0) {
            setSelectedBookId(expressionBooks[0].id)
        }
    }, [showExpressionModal, expressionBooks])

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
        setAddedKeywords((prev) => [...prev, keyword])
        onAddKeyword?.(keyword)
    }

    // 키워드 제거 처리
    const handleRemoveKeyword = (keyword: Keyword) => {
        setAddedKeywords((prev) => prev.filter((k) => k.word !== keyword.word))
        onRemoveKeyword?.(keyword)
    }

    // 키워드가 이미 추가되었는지 확인
    const checkIsAdded = (keyword: Keyword) => {
        return addedKeywords.some((k) => k.word === keyword.word)
    }

    // 표현 추가 처리
    const handleAddExpression = async () => {
        if (!selectedSubtitle || !videoId || selectedSubtitle.subtitleId === undefined) {
            alert('선택된 자막이 없거나 비디오 정보가 없습니다.')
            return
        }
        if (!selectedBookId) {
            alert('표현함을 선택해주세요.')
            return
        }
        setIsLoading(true)
        try {
            const { data, error } = await client.POST(`/api/v1/expressionbooks/{expressionBookId}/expressions`, {
                params: {
                    query: {
                        userDetails: {},
                    },
                    path: {
                        expressionBookId: selectedBookId,
                    },
                },
                body: {
                    videoId: videoId,
                    subtitleId: selectedSubtitle.subtitleId,
                },
            })
            if (error) {
                console.error('표현 저장 실패:', error)
                alert('표현 저장에 실패했습니다.')
                return
            }
            const selectedBook = expressionBooks.find((book) => book.id === selectedBookId)
            alert(`"${selectedBook?.name}" 표현함에 표현이 추가되었습니다.`)
            setShowExpressionModal(false)
        } catch (error) {
            console.error('표현 저장 오류:', error)
            alert('표현 저장 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeywordHover = (keyword: Keyword, event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setHoveredKeyword(keyword)
        setHoverPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10,
        })
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
                                    setHoveredKeyword({
                                        ...keyword,
                                        subtitleId: selectedSubtitle.subtitleId || 0,
                                        videoId: videoId || '',
                                    })
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
                                    setHoveredKeyword({
                                        ...keyword,
                                        subtitleId: selectedSubtitle.subtitleId || 0,
                                        videoId: videoId || '',
                                    })
                                }
                            }
                        }}
                        onMouseOut={() => setHoveredKeyword(null)}
                    />
                    {showTranscript && (
                        <div className="rounded-lg bg-[var(--color-sub-2)] p-2 text-[var(--color-main)]">
                            {selectedSubtitle.transcript}
                        </div>
                    )}
                </div>

                {/* 🔹 표현 버튼과 한글 자막 토글 버튼 */}
                <div className="flex justify-between items-center mt-2">
                    <button
                        onClick={() => setShowExpressionModal(true)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[var(--color-main)] text-white rounded-lg hover:bg-[var(--color-sub-1)] transition-colors disabled:opacity-70"
                    >
                        {isLoading ? '표현 추가 중...' : '표현 추가'}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPrevSubtitle}
                                className={`px-2 py-1 rounded ${
                                    onPrevSubtitle ? 'bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!onPrevSubtitle}
                            >
                                &larr;
                            </button>
                            <span className="text-sm font-medium">{subtitleIndex + 1}</span>
                            <button
                                onClick={onNextSubtitle}
                                className={`px-2 py-1 rounded ${
                                    onNextSubtitle ? 'bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!onNextSubtitle}
                            >
                                &rarr;
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">한국어 자막</span>
                            <button
                                onClick={() => setShowTranscript(!showTranscript)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${
                                    showTranscript ? 'bg-[var(--color-main)]' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                        showTranscript ? 'left-7' : 'left-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 표현함 선택 모달 */}
            {showExpressionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 relative">
                        <h3 className="text-lg font-bold mb-4">표현함 선택</h3>
                        {expressionBooks.length === 0 ? (
                            <p className="text-gray-500">표현함이 없습니다. 표현함을 먼저 생성해주세요.</p>
                        ) : (
                            <>
                                <select
                                    className="w-full p-3 mb-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                    value={selectedBookId ?? expressionBooks[0].id}
                                    onChange={(e) => setSelectedBookId(Number(e.target.value))}
                                >
                                    {expressionBooks.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={handleAddExpression}
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-[var(--color-main)] text-white rounded-lg hover:bg-[var(--color-sub-1)] transition-colors disabled:opacity-70 font-bold"
                                    >
                                        {isLoading ? '저장 중...' : '저장'}
                                    </button>
                                    <button
                                        onClick={() => setShowExpressionModal(false)}
                                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                                    >
                                        취소
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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
