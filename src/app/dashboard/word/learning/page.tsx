'use client'

import DropdownCheckBox from '@/components/common/dropdownCheckBox'
import Search from '@/components/common/search'
import PlusIcon from '@/components/icon/plusIcon'
import WordIcon from '@/components/icon/wordIcon'
import LearningCard from '@/components/learning/learningCard'
import WordAddModal from '@/components/learning/WordAddModal'
import WordCard from '@/components/learning/wordCard'
import WordMoveDeleteModal from '@/components/learning/WordMoveDeleteModal'
import type { components } from '@/lib/backend/apiV1/schema'
import client from '@/lib/backend/client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type WordbookResponse = components['schemas']['WordbookResponse']
type WordResponse = components['schemas']['WordResponse']

export default function WordLearningPage() {
    const [wordbooks, setWordbooks] = useState<WordbookResponse[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedWordbookIds, setSelectedWordbookIds] = useState<number[]>([])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedWordbookId, setSelectedWordbookId] = useState<number | null>(null)
    const [isMoveDeleteModalOpen, setIsMoveDeleteModalOpen] = useState(false)
    const resultRef = useRef<HTMLDivElement>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [words, setWords] = useState<WordResponse[]>([])
    const [selectedWords, setSelectedWords] = useState<WordResponse[]>([])
    const [isAddWordbookModalOpen, setIsAddWordbookModalOpen] = useState(false)
    const [newWordbookName, setNewWordbookName] = useState('')
    const [isDeleteWordbookModalOpen, setIsDeleteWordbookModalOpen] = useState(false)
    const [deleteWordbookId, setDeleteWordbookId] = useState<number | null>(null)
    const [moveDeleteDefaultTargetId, setMoveDeleteDefaultTargetId] = useState<number | ''>('')

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword)
        if (keyword.trim()) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }

    const handleWordbookSelect = async (ids: number[]) => {
        setSelectedWordbookIds(ids)
        // 기본 단어장이나 첫 번째 단어장을 선택
        const defaultWordbook = wordbooks.find((wb) => wb.name === '기본 단어장')
        if (ids.length > 0) {
            const newSelectedId = defaultWordbook?.wordbookId || ids[0]
            setSelectedWordbookId(newSelectedId)
        }

        try {
            setIsLoading(true)
            const { data, error } = await client.GET('/api/v1/wordbooks/view', {
                params: {
                    query: {
                        wordbookIds: ids,
                    },
                },
            })

            if (error || !data?.data) {
                console.error('단어 데이터 요청 실패:', error)
                return
            }

            setWords(data.data)
        } catch (error) {
            console.error('단어 데이터 요청 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const openAddModal = () => {
        if (selectedWordbookIds.length === 0) {
            alert('단어를 추가할 단어장을 먼저 선택해주세요.')
            return
        }
        if (!selectedWordbookId && selectedWordbookIds.length > 0) {
            setSelectedWordbookId(selectedWordbookIds[0])
        }
        setIsAddModalOpen(true)
    }

    const closeAddModal = () => {
        setIsAddModalOpen(false)
    }

    const toggleEditMode = () => {
        if (isEditMode) {
            setSelectedWords([])
        }
        setIsEditMode(!isEditMode)
    }

    const handleSelectComplete = () => {
        if (selectedWords.length === 0) {
            setIsEditMode(false)
            return
        }
        const sourceWordbookIds = Array.from(new Set(selectedWords.map((word) => word.wordBookId)))

        if (sourceWordbookIds.length > 1) {
            toast.error('서로 다른 단어장의 단어는 한 번에 이동할 수 없습니다.')
            return
        }
        setMoveDeleteDefaultTargetId(sourceWordbookIds[0] || '')
        setIsMoveDeleteModalOpen(true)
    }

    const handleMoveWords = async (targetWordbookId: number) => {
        try {
            const sourceWordbookId = selectedWords[0]?.wordBookId
            if (!sourceWordbookId) {
                toast.error('단어장 ID를 찾을 수 없습니다.')
                return
            }

            const moveItems = selectedWords.map((word) => ({
                fromWordbookId: sourceWordbookId,
                word: word.word,
            }))

            const response = await client.PATCH('/api/v1/wordbooks/words/move', {
                body: {
                    destinationWordbookId: targetWordbookId,
                    words: moveItems,
                },
            })

            if (response.error) {
                throw new Error('단어 이동 실패')
            }

            // 단어 목록 새로고침
            const fetchWords = async () => {
                if (selectedWordbookIds.length === 0) {
                    setWords([])
                    return
                }

                try {
                    setIsLoading(true)
                    const { data, error } = await client.GET('/api/v1/wordbooks/view', {
                        params: {
                            query: {
                                wordbookIds: selectedWordbookIds,
                            },
                        },
                    })

                    if (error || !data?.data) {
                        console.error('단어 데이터 요청 실패:', error)
                        return
                    }

                    setWords(data.data)
                } catch (error) {
                    console.error('단어 데이터 요청 실패:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            // 단어장 목록 새로고침
            const fetchWordbooks = async () => {
                try {
                    const { data, error } = await client.GET('/api/v1/wordbooks', {})
                    if (!error && data?.data) {
                        setWordbooks(data.data)
                    }
                } catch (error) {
                    console.error('단어장 데이터 요청 실패:', error)
                }
            }

            await Promise.all([fetchWords(), fetchWordbooks()])
            setSelectedWords([])
            setIsEditMode(false)
            setIsMoveDeleteModalOpen(false)
            toast.success('선택한 단어들이 이동되었습니다.')
        } catch (error) {
            console.error('단어 이동 실패:', error)
            toast.error('단어 이동에 실패했습니다.')
        }
    }

    const handleDeleteWords = async () => {
        try {
            if (!selectedWordbookId) {
                throw new Error('단어장이 선택되지 않았습니다.')
            }

            const deleteItems = selectedWords.map((word) => ({
                wordbookId: selectedWordbookId,
                word: word.word,
            }))

            const response = await client.POST('/api/v1/wordbooks/words/delete', {
                body: {
                    words: deleteItems,
                },
            })

            if (response.error) {
                throw new Error('단어 삭제 실패')
            }

            // 단어 목록 새로고침
            const fetchWords = async () => {
                if (selectedWordbookIds.length === 0) {
                    setWords([])
                    return
                }

                try {
                    setIsLoading(true)
                    const { data, error } = await client.GET('/api/v1/wordbooks/view', {
                        params: {
                            query: {
                                wordbookIds: selectedWordbookIds,
                            },
                        },
                    })

                    if (error || !data?.data) {
                        console.error('단어 데이터 요청 실패:', error)
                        return
                    }

                    setWords(data.data)
                } catch (error) {
                    console.error('단어 데이터 요청 실패:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            // 단어장 목록 새로고침
            const fetchWordbooks = async () => {
                try {
                    const { data, error } = await client.GET('/api/v1/wordbooks', {})
                    if (!error && data?.data) {
                        setWordbooks(data.data)
                    }
                } catch (error) {
                    console.error('단어장 데이터 요청 실패:', error)
                }
            }

            await Promise.all([fetchWords(), fetchWordbooks()])
            setSelectedWords([])
            setIsEditMode(false)
            setIsMoveDeleteModalOpen(false)
            toast.success('선택한 단어들이 삭제되었습니다.')
        } catch (error) {
            console.error('단어 삭제 실패:', error)
            toast.error('단어 삭제에 실패했습니다.')
        }
    }

    const handleAddWord = async (wordbookId: number, word: string) => {
        try {
            const response = await client.POST('/api/v1/wordbooks/{wordbookId}/words/custom', {
                params: {
                    path: {
                        wordbookId,
                    },
                },
                body: {
                    word,
                },
            })

            if (response.error) {
                throw new Error('단어 추가 실패')
            }

            // 단어 목록 새로고침
            const fetchWords = async () => {
                if (selectedWordbookIds.length === 0) {
                    setWords([])
                    return
                }

                try {
                    setIsLoading(true)
                    const promises = selectedWordbookIds.map((id) =>
                        client.GET('/api/v1/wordbooks/{wordbookId}/words', {
                            params: {
                                path: {
                                    wordbookId: id,
                                },
                            },
                        }),
                    )

                    const responses = await Promise.all(promises)
                    const allWords = responses.flatMap((response) => {
                        if (response.error || !response.data?.data) {
                            console.error('단어 데이터 요청 실패:', response.error)
                            return []
                        }
                        return response.data.data
                    })

                    setWords(allWords)
                } catch (error) {
                    console.error('단어 데이터 요청 실패:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            fetchWords()
            alert('단어가 추가되었습니다.')
        } catch (error) {
            console.error('단어 추가 실패:', error)
            alert('단어 추가에 실패했습니다.')
        }
    }

    const handleSelectedWordsChange = (words: WordResponse[]) => {
        setSelectedWords(words)
    }

    const handleAddWordbook = async () => {
        if (!newWordbookName.trim()) {
            toast.error('단어장 이름을 입력해주세요.')
            return
        }
        try {
            setIsLoading(true)
            const response = await client.POST('/api/v1/wordbooks', {
                body: { name: newWordbookName.trim() },
            })
            if (response.error) {
                throw new Error('단어장 추가 실패')
            }
            setIsAddWordbookModalOpen(false)
            setNewWordbookName('')
            // 단어장 목록 새로고침
            const { data, error } = await client.GET('/api/v1/wordbooks', {})
            if (!error && data?.data) {
                setWordbooks(data.data)
            }
            toast('단어장이 추가되었습니다.')
        } catch (error) {
            toast.error('사용할 수 없는 멤버십입니다. 구독해주세요')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteWordbook = async () => {
        if (!deleteWordbookId) {
            toast.error('삭제할 단어장을 선택해주세요.')
            return
        }
        try {
            setIsLoading(true)
            const response = await client.DELETE('/api/v1/wordbooks/{wordbookId}', {
                params: { path: { wordbookId: deleteWordbookId } },
            })
            if (response.error) {
                throw new Error('단어장 삭제 실패')
            }
            setIsDeleteWordbookModalOpen(false)
            setDeleteWordbookId(null)
            // 단어장 목록 새로고침
            const { data, error } = await client.GET('/api/v1/wordbooks', {})
            if (!error && data?.data) {
                setWordbooks(data.data)
            }
            toast('단어장이 삭제되었습니다.')
        } catch (error) {
            toast.error('오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchWordbooks = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await client.GET('/api/v1/wordbooks', {})

                if (error) {
                    console.error('단어장 데이터 요청 실패:', error)
                    return
                }

                if (data?.data) {
                    setWordbooks(data.data)
                }
            } catch (error) {
                console.error('단어장 데이터 요청 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWordbooks()
    }, [])

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    <WordIcon />
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">Word Learning</h3>
            </div>

            <div className="flex flex-col gap-6 bg-[var(--color-sub-2)] p-6 rounded-lg h-[calc(100vh-120px)]">
                <div className="w-[80%] m-auto">
                    <Search onSearch={handleSearch} placeholder="단어 또는 뜻 검색..." />
                </div>
                <div className="flex-1">
                    <LearningCard
                        title="단어"
                        descriptions={[
                            { text: '내 {title}장에서 톡톡 랜덤 등장!', strong: ['랜덤'] },
                            { text: '반복과 호기심 학습을 한번에!', strong: ['반복', '호기심'] },
                        ]}
                        wordbooks={wordbooks}
                        isLoading={isLoading}
                    />
                </div>

                <div className="flex flex-col flex-1 gap-2 h-full overflow-hidden" ref={resultRef}>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            📚 내 단어장
                            {searchKeyword && (
                                <span className="ml-2 text-sm text-[var(--color-point)]">
                                    '{searchKeyword}' 검색 결과
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                className="bg-[var(--color-main)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity"
                                onClick={() => setIsAddWordbookModalOpen(true)}
                            >
                                단어장 추가
                            </button>
                            <button
                                className="bg-[var(--color-warning)] text-sm text-[var(--color-white)] p-2 rounded-lg hover:opacity-90 transition-opacity"
                                onClick={() => setIsDeleteWordbookModalOpen(true)}
                            >
                                단어장 삭제
                            </button>
                            <DropdownCheckBox
                                wordbooks={wordbooks}
                                onWordbookSelect={handleWordbookSelect}
                                studyType="WORD"
                            />
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-1 bg-[var(--color-main)] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                            >
                                <PlusIcon />
                                단어 추가
                            </button>
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
                                {isEditMode ? '선택 완료' : '단어 편집'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <WordCard
                            selectedWordbookIds={selectedWordbookIds}
                            searchKeyword={searchKeyword}
                            isEditMode={isEditMode}
                            onSelectWords={handleSelectedWordsChange}
                            words={words}
                            isLoading={isLoading}
                            selectedWords={selectedWords}
                        />
                    </div>
                </div>
            </div>

            <WordAddModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                selectedWordbookId={selectedWordbookId}
                selectedWordbookIds={selectedWordbookIds}
                wordbooks={wordbooks.map((wb) => ({
                    wordbookId: wb.wordbookId || 0,
                    name: wb.name || '',
                    language: wb.language || 'ENGLISH',
                    wordCount: wb.wordCount || 0,
                    learnedWordCount: wb.learnedWordCount || 0,
                }))}
                onAddWord={handleAddWord}
                onWordbookSelect={setSelectedWordbookId}
            />

            <WordMoveDeleteModal
                isOpen={isMoveDeleteModalOpen}
                onClose={() => setIsMoveDeleteModalOpen(false)}
                wordbooks={wordbooks.map((wb) => ({
                    id: wb.wordbookId || 0,
                    name: wb.name || '',
                    language: wb.language || 'ENGLISH',
                    wordCount: wb.wordCount || 0,
                    learnedWordCount: wb.learnedWordCount || 0,
                }))}
                onMoveWords={handleMoveWords}
                onDeleteWords={handleDeleteWords}
                defaultTargetId={moveDeleteDefaultTargetId}
            />

            {isAddWordbookModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <h2 className="text-lg font-bold mb-4">단어장 추가</h2>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                            placeholder="단어장 이름을 입력하세요"
                            value={newWordbookName}
                            onChange={(e) => setNewWordbookName(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleAddWordbook}
                                className="px-6 py-2 bg-[var(--color-main)] text-white rounded-lg hover:bg-[var(--color-sub-1)] transition-colors font-bold disabled:opacity-70"
                                disabled={isLoading}
                            >
                                저장
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddWordbookModalOpen(false)
                                    setNewWordbookName('')
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 단어장 삭제 모달 */}
            {isDeleteWordbookModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <h2 className="text-lg font-bold mb-4">단어장 삭제</h2>
                        <select
                            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                            value={deleteWordbookId ?? ''}
                            onChange={(e) => setDeleteWordbookId(Number(e.target.value))}
                            disabled={isLoading}
                        >
                            <option value="" disabled>
                                삭제할 단어장을 선택하세요
                            </option>
                            {wordbooks.map((wb) => (
                                <option key={wb.wordbookId} value={wb.wordbookId || 0}>
                                    {wb.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleDeleteWordbook}
                                className="px-6 py-2 bg-[var(--color-warning)] text-white rounded-lg hover:bg-red-600 transition-colors font-bold disabled:opacity-70"
                                disabled={isLoading}
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteWordbookModalOpen(false)
                                    setDeleteWordbookId(null)
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
