'use client'

import DropdownCheckBox from '@/components/common/dropdownCheckBox'
import Search from '@/components/common/search'
import ExpressionIcon from '@/components/icon/expressionIcon'
import ExpressionCard from '@/components/learning/expressionCard'
import ExpressionMoveDeleteModal from '@/components/learning/ExpressionMoveDeleteModal'
import LearningCard from '@/components/learning/learningCard'
import type { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type ExpressionBookResponse = components['schemas']['ExpressionBookResponse']
type ExpressionResponse = components['schemas']['ExpressionResponse']

export default function ExpressionPage() {
    const [expressionBooks, setExpressionBooks] = useState<ExpressionBookResponse[]>([])
    const [expressions, setExpressions] = useState<ExpressionResponse[]>([])
    const [filteredExpressions, setFilteredExpressions] = useState<ExpressionResponse[]>([])
    const [displayCount, setDisplayCount] = useState(10)
    const observerRef = useRef<HTMLDivElement>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [selectedExpressionBookIds, setSelectedExpressionBookIds] = useState<number[]>([])
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedExpressions, setSelectedExpressions] = useState<ExpressionResponse[]>([])
    const [isMoveDeleteModalOpen, setIsMoveDeleteModalOpen] = useState(false)
    const [selectedExpressionBookId, setSelectedExpressionBookId] = useState<number | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [newExpressionBookName, setNewExpressionBookName] = useState('')
    const [moveDeleteDefaultTargetId, setMoveDeleteDefaultTargetId] = useState<number | ''>('')

    // 표현함 목록 조회
    const fetchExpressionBooks = async () => {
        try {
            const { data } = await client.GET('/api/v1/expressionbooks')
            if (data?.data) {
                setExpressionBooks(data.data)
            }
        } catch (error) {
            console.error('표현함 목록 조회 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // 전체 표현 목록 조회
    const fetchExpressions = async (expressionBookIds?: number[]) => {
        try {
            setIsLoading(true)
            const { data, error } = await client.GET('/api/v1/expressionbooks/view', {
                params: {
                    query: {
                        expressionBookIds: expressionBookIds,
                    },
                },
            })

            if (error || !data?.data) {
                setExpressions([])
                setFilteredExpressions([])
                return
            }

            console.log('표현 목록 조회 응답:', data?.data)

            setExpressions(data.data)
            setFilteredExpressions(data.data)
        } catch (error) {
            console.error('표현 목록 조회 실패:', error)
            setExpressions([])
            setFilteredExpressions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        if (!term.trim()) {
            setFilteredExpressions(expressions)
            return
        }

        const searchTermLower = term.toLowerCase()
        const filtered = expressions.filter(
            (expression) =>
                expression.sentence?.toLowerCase().includes(searchTermLower) ||
                expression.videoTitle?.toLowerCase().includes(searchTermLower) ||
                expression.description?.toLowerCase().includes(searchTermLower),
        )
        setFilteredExpressions(filtered)
    }

    useEffect(() => {
        fetchExpressionBooks()
        fetchExpressions()
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && displayCount < filteredExpressions.length) {
                    setDisplayCount((prev) => Math.min(prev + 10, filteredExpressions.length))
                }
            },
            { threshold: 0.5 },
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [displayCount, filteredExpressions.length])

    useEffect(() => {
        // 검색어가 변경되면 displayCount 초기화
        setDisplayCount(10)
    }, [searchTerm])

    // 화면에 표시할 표현들
    const displayedExpressions = filteredExpressions.slice(0, displayCount)

    const handleWordbookSelect = async (ids: number[]) => {
        setSelectedExpressionBookIds(ids)
        if (ids.length > 0) {
            setSelectedExpressionBookId(ids[0])
        } else {
            setSelectedExpressionBookId(null)
        }

        // 선택된 표현함의 표현만 조회
        await fetchExpressions(ids)
    }

    const toggleEditMode = () => {
        if (isEditMode) {
            setSelectedExpressions([])
        }
        setIsEditMode(!isEditMode)
    }

    const handleSelectComplete = () => {
        if (selectedExpressions.length === 0) {
            setIsEditMode(false)
            return
        }
        // 선택된 표현들의 expressionBookId 집합 구하기
        const bookIds = Array.from(new Set(selectedExpressions.map((e) => e.expressionBookId)))
        if (bookIds.length > 1) {
            toast.error('서로 다른 표현함의 표현은 한 번에 이동/삭제할 수 없습니다.')
            return
        }
        setMoveDeleteDefaultTargetId(bookIds[0] || '')
        setIsMoveDeleteModalOpen(true)
    }

    const handleMoveExpressions = async (targetExpressionBookId: number) => {
        try {
            const sourceExpressionBookId = selectedExpressions[0]?.expressionBookId
            if (!sourceExpressionBookId) {
                toast.error('표현함 ID를 찾을 수 없습니다.')
                return
            }
            const requestBody = {
                sourceExpressionBookId,
                targetExpressionBookId,
                expressionIds: selectedExpressions.map((exp) => exp.expressionId || 0),
            }
            console.log('표현 이동 요청:', requestBody)
            const response = await client.PATCH('/api/v1/expressionbooks/expressions/move', {
                body: requestBody,
            })

            if (response.error) {
                throw new Error('표현 이동 실패')
            }

            // 표현 목록 새로고침
            await fetchExpressions(selectedExpressionBookIds)
            await fetchExpressionBooks() // 표현함 목록도 새로고침
            setSelectedExpressions([])
            setIsEditMode(false)
            setIsMoveDeleteModalOpen(false)
            toast.success('선택한 표현들이 이동되었습니다.')
        } catch (error) {
            console.error('표현 이동 실패:', error)
            throw error // 에러를 상위로 전파하여 모달에서 처리하도록 함
        }
    }

    const handleDeleteExpressions = async () => {
        try {
            const expressionBookId = selectedExpressions[0]?.expressionBookId
            if (!expressionBookId) {
                toast.error('표현함 ID를 찾을 수 없습니다.')
                return
            }
            const requestBody = {
                expressionBookId,
                expressionIds: selectedExpressions.map((exp) => exp.expressionId || 0),
            }
            console.log('표현 삭제 요청:', requestBody)
            const response = await client.POST('/api/v1/expressionbooks/expressions/delete', {
                body: requestBody,
            })

            if (response.error) {
                throw new Error('표현 삭제 실패')
            }

            // 표현 목록 새로고침
            await fetchExpressions(selectedExpressionBookIds)
            await fetchExpressionBooks() // 표현함 목록도 새로고침
            setSelectedExpressions([])
            setIsEditMode(false)
            setIsMoveDeleteModalOpen(false)
            toast.success('선택한 표현들이 삭제되었습니다.')
        } catch (error) {
            console.error('표현 삭제 실패:', error)
            throw error // 에러를 상위로 전파하여 모달에서 처리하도록 함
        }
    }

    const handleAddExpressionBook = async () => {
        try {
            if (!newExpressionBookName.trim()) {
                alert('표현함 이름을 입력해주세요.')
                return
            }

            const { data, error } = await client.POST('/api/v1/expressionbooks', {
                body: {
                    name: newExpressionBookName.trim(),
                },
            })

            if (error) {
                throw new Error('표현함 생성 실패')
            }

            fetchExpressionBooks()
            setNewExpressionBookName('')
            setIsAddModalOpen(false)
            alert('표현함이 생성되었습니다.')
        } catch (error) {
            console.error('표현함 생성 실패:', error)
            toast.error('사용할 수 없는 멤버십입니다. 구독해주세요')
        }
    }

    const handleDeleteExpressionBook = async () => {
        try {
            if (!selectedExpressionBookId) {
                alert('삭제할 표현함을 선택해주세요.')
                return
            }

            const { error } = await client.DELETE('/api/v1/expressionbooks/{expressionBookId}', {
                params: {
                    path: {
                        expressionBookId: selectedExpressionBookId,
                    },
                },
            })

            if (error) {
                throw new Error('표현함 삭제 실패')
            }

            fetchExpressionBooks()
            setIsDeleteModalOpen(false)
            alert('표현함이 삭제되었습니다.')
        } catch (error) {
            console.error('표현함 삭제 실패:', error)
            toast.error('표현함 삭제에 실패했습니다.')
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <ExpressionIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Expression Learning</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-120px)]">
                <div className="w-[80%] m-auto">
                    <Search onSearch={handleSearch} placeholder="문장, 제목으로 검색..." />
                </div>

                <div className="flex-1">
                    <LearningCard
                        title="표현함"
                        descriptions={[
                            { text: '내 {title}에서 톡톡 랜덤 등장!', strong: ['랜덤'] },
                            { text: '반복과 호기심 학습을 한번에!', strong: ['반복', '호기심'] },
                        ]}
                        wordbooks={expressionBooks.map((book) => ({
                            ...book,
                            wordbookId: book.expressionBookId,
                            wordCount: book.expressionCount,
                            learnedWordCount: book.learnedExpressionCount,
                        }))}
                        isLoading={isLoading}
                    />
                </div>

                <div className="flex flex-col flex-1 gap-2 h-full overflow-hidden">
                    {/* 상단 타이틀 */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">📚 내 표현함</h1>
                        <div className="flex items-center gap-2">
                            
                            <button
                                className="bg-[var(--color-main)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                표현함 추가
                            </button>
                            <button
                                className="bg-[var(--color-warning)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                표현함 삭제
                            </button>
                           
                            <DropdownCheckBox
                                wordbooks={expressionBooks.map((book) => ({
                                    ...book,
                                    wordbookId: book.expressionBookId,
                                    wordCount: book.expressionCount,
                                    learnedWordCount: book.learnedExpressionCount,
                                }))}
                                onWordbookSelect={handleWordbookSelect}
                                studyType="EXPRESSION"
                            />

                            <button
                                onClick={isEditMode ? handleSelectComplete : toggleEditMode}
                                className={`flex items-center gap-1 ${
                                    isEditMode
                                        ? 'bg-[var(--color-point)] text-white'
                                        : 'bg-white text-[var(--color-main)] border border-[var(--color-main)]'
                                } px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                    />
                                </svg>
                                {isEditMode ? '선택 완료' : '표현 편집'}
                            </button>
                        </div>
                    </div>

                    {/* 카드 리스트 */}
                    <div className="grid grid-cols-2 flex-1 overflow-y-auto p-2 gap-4">
                        {displayedExpressions.map((expression) => (
                            <ExpressionCard
                                key={expression.expressionId}
                                expression={expression}
                                isEditMode={isEditMode}
                                isSelected={selectedExpressions.some((e) => e.expressionId === expression.expressionId)}
                                onSelect={() => {
                                    if (isEditMode) {
                                        setSelectedExpressions((prev) => {
                                            const isAlreadySelected = prev.some(
                                                (e) => e.expressionId === expression.expressionId,
                                            )
                                            if (isAlreadySelected) {
                                                return prev.filter((e) => e.expressionId !== expression.expressionId)
                                            } else {
                                                return [...prev, expression]
                                            }
                                        })
                                    }
                                }}
                            />
                        ))}
                        {filteredExpressions.length === 0 && (
                            <div className="col-span-2 flex items-center justify-center text-gray-500 py-8">
                                검색 결과가 없습니다.
                            </div>
                        )}
                        {displayCount < filteredExpressions.length && (
                            <div ref={observerRef} className="col-span-2 h-20 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-main)]"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ExpressionMoveDeleteModal
                isOpen={isMoveDeleteModalOpen}
                onClose={() => setIsMoveDeleteModalOpen(false)}
                expressionBooks={expressionBooks}
                onMoveExpressions={handleMoveExpressions}
                onDeleteExpressions={handleDeleteExpressions}
                defaultTargetId={moveDeleteDefaultTargetId}
            />

            {/* 표현함 추가 모달 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px]">
                        <h2 className="text-xl font-bold mb-4">표현함 추가</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">표현함 이름</label>
                            <input
                                type="text"
                                value={newExpressionBookName}
                                onChange={(e) => setNewExpressionBookName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="표현함 이름을 입력하세요"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setNewExpressionBookName('')
                                    setIsAddModalOpen(false)
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddExpressionBook}
                                className="px-4 py-2 bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 표현함 삭제 모달 */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px]">
                        <h2 className="text-xl font-bold mb-4">표현함 삭제</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">삭제할 표현함</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                value={selectedExpressionBookId || ''}
                                onChange={(e) => setSelectedExpressionBookId(Number(e.target.value))}
                            >
                                <option value="">표현함을 선택하세요</option>
                                {expressionBooks.map((book) => (
                                    <option key={book.expressionBookId} value={book.expressionBookId}>
                                        {book.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteExpressionBook}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
