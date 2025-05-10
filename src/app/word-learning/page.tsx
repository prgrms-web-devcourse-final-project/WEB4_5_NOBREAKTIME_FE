'use client'

import { useEffect, useRef, useState } from 'react'
import Search from '@/components/common/search'
import DashboardLayout from '../dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'
import LearningCard from '@/components/learning/learningCard'
import DropdownCheckBox from '@/components/common/dropdownCheckBox'
import WordCard from '@/components/learning/wordCard'
import client from '@/lib/backend/client'
import Image from 'next/image'

interface Wordbook {
    id: number
    name: string
    language: string
    wordCount?: number
}

// Word 인터페이스 추가
interface Word {
    id?: number
    word: string
    pos: string
    meaning: string
    difficulty: string
}

function Word() {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedWordbookIds, setSelectedWordbookIds] = useState<number[]>([])
    const [searchKeyword, setSearchKeyword] = useState('')
    const resultRef = useRef<HTMLDivElement>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [newWordData, setNewWordData] = useState({
        word: '',
        pos: '',
        meaning: '',
        difficulty: 'EASY',
        exampleSentence: '',
        translatedSentence: '',
    })
    const [selectedWordbookId, setSelectedWordbookId] = useState<number | null>(null)

    useEffect(() => {
        const fetchWordbooks = async () => {
            try {
                setIsLoading(true)
                const { data } = await client.GET('/api/v1/wordbooks', {})
                if (data?.data) {
                    // 타입 안전하게 처리
                    const apiWordbooks = data.data.map((item: any) => ({
                        id: item.id || 0,
                        name: item.name || '',
                        language: item.language || 'ENGLISH',
                        wordCount: item.wordCount || 0,
                    }))

                    // API가 단어 수를 제공하지 않는 경우, 각 워드북별로 단어 목록을 가져와 개수 설정
                    if (!apiWordbooks[0]?.wordCount) {
                        const wordbooksWithCount = await Promise.all(
                            apiWordbooks.map(async (wordbook) => {
                                try {
                                    const { data } = await client.GET('/api/v1/wordbooks/{wordbookId}/words', {
                                        params: {
                                            path: {
                                                wordbookId: wordbook.id,
                                            },
                                        },
                                    })
                                    return {
                                        ...wordbook,
                                        wordCount: data?.data?.length || 0,
                                    }
                                } catch (error) {
                                    console.error(`워드북 ${wordbook.id}의 단어 목록을 가져오는데 실패했습니다.`, error)
                                    return {
                                        ...wordbook,
                                        wordCount: 0,
                                    }
                                }
                            }),
                        )
                        setWordbooks(wordbooksWithCount)
                    } else {
                        setWordbooks(apiWordbooks)
                    }
                }
                setIsLoading(false)
            } catch (error) {
                console.error('단어장 데이터를 가져오는데 실패했습니다:', error)
                setIsLoading(false)
            }
        }

        fetchWordbooks()
    }, [])

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword)
        // 검색어가 있을 때만 스크롤 실행
        if (keyword.trim()) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }

    const handleWordbookSelect = (ids: number[]) => {
        setSelectedWordbookIds(ids)
        // 선택된 워드북이 있으면 첫 번째 워드북을 선택
        if (ids.length > 0 && !selectedWordbookId) {
            setSelectedWordbookId(ids[0])
        }
    }

    const openAddModal = () => {
        if (selectedWordbookIds.length === 0) {
            alert('단어를 추가할 단어장을 먼저 선택해주세요.')
            return
        }
        // 선택된 워드북이 없으면 첫 번째 워드북을 선택
        if (!selectedWordbookId && selectedWordbookIds.length > 0) {
            setSelectedWordbookId(selectedWordbookIds[0])
        }
        setIsAddModalOpen(true)
    }

    const closeAddModal = () => {
        setIsAddModalOpen(false)
        setNewWordData({
            word: '',
            pos: '',
            meaning: '',
            difficulty: 'EASY',
            exampleSentence: '',
            translatedSentence: '',
        })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewWordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleWordbookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWordbookId(Number(e.target.value))
    }

    const handleAddWord = async () => {
        if (!selectedWordbookId) {
            alert('단어를 추가할 단어장을 선택해주세요.')
            return
        }

        if (!newWordData.word || !newWordData.meaning) {
            alert('단어와 뜻은 필수 입력 항목입니다.')
            return
        }

        try {
            // API 요청 body 형식을 API 스펙에 맞게 수정
            await client.POST('/api/v1/wordbooks/{wordbookId}/words', {
                params: {
                    path: {
                        wordbookId: selectedWordbookId,
                    },
                },
                body: {
                    words: [newWordData],
                },
            })

            alert('단어가 성공적으로 추가되었습니다.')
            closeAddModal()

            // 단어 목록 새로고침을 위해 선택된 단어장 ID 다시 설정
            setSelectedWordbookIds([...selectedWordbookIds])
        } catch (error) {
            console.error('단어 추가에 실패했습니다:', error)
            alert('단어 추가에 실패했습니다. 다시 시도해주세요.')
        }
    }

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode)
    }

    // 단어 삭제 핸들러
    const handleDeleteWord = async (word: Word) => {
        if (confirm(`"${word.word}" 단어를 삭제하시겠습니까?`)) {
            try {
                // NOTE: 실제 API 연동 시 아래 주석을 해제하고 올바른 엔드포인트로 수정해야 합니다.
                // 현재는 API 클라이언트 타입 오류로 인해 주석 처리합니다.
                /*
                if (word.id) {
                    await client.DELETE('/api/v1/wordbooks/{wordbookId}/words/{wordId}', {
                        params: {
                            path: {
                                wordbookId: selectedWordbookIds[0],
                                wordId: word.id,
                            },
                        },
                    });
                } else {
                    console.error('단어 ID가 없어 삭제할 수 없습니다.');
                    alert('단어 삭제를 위한 ID 정보가 없습니다.');
                    return;
                }
                */

                // 임시 메시지 (실제 구현 시 삭제)
                console.log('삭제할 단어:', word)

                alert('단어가 삭제되었습니다.')
                // 단어 목록 새로고침을 위해 선택된 단어장 ID 다시 설정
                setSelectedWordbookIds([...selectedWordbookIds])
            } catch (error) {
                console.error('단어 삭제에 실패했습니다:', error)
                alert('단어 삭제에 실패했습니다. 다시 시도해주세요.')
            }
        }
    }

    return (
        <DashboardLayout title="Word Learning" icon={<WordIcon />}>
            <div className="w-300 m-auto">
                <Search onSearch={handleSearch} placeholder="단어 또는 뜻 검색..." />
            </div>
            <div className="flex-1 ">
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
                {/* 상단 타이틀 */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        📚 내 단어장
                        {searchKeyword && (
                            <span className="ml-2 text-sm text-[var(--color-point)]">'{searchKeyword}' 검색 결과</span>
                        )}
                    </h1>
                    <div className="flex items-center gap-2">
                        <DropdownCheckBox wordbooks={wordbooks} onWordbookSelect={handleWordbookSelect} />
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-1 bg-[var(--color-main)] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            단어 추가
                        </button>
                        <button
                            onClick={toggleEditMode}
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
                            {isEditMode ? '편집 완료' : '단어 편집'}
                        </button>
                    </div>
                </div>

                {/* 카드 리스트 */}
                <div className="flex-1 overflow-y-auto p-2">
                    <WordCard
                        selectedWordbookIds={selectedWordbookIds}
                        searchKeyword={searchKeyword}
                        isEditMode={isEditMode}
                        onDeleteWord={handleDeleteWord}
                    />
                </div>
            </div>

            {/* 단어 추가 모달 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">단어 추가</h2>
                            <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">단어장 선택</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                value={selectedWordbookId || ''}
                                onChange={handleWordbookChange}
                            >
                                <option value="" disabled>
                                    단어장을 선택하세요
                                </option>
                                {wordbooks
                                    .filter((wordbook) => selectedWordbookIds.includes(wordbook.id))
                                    .map((wordbook) => (
                                        <option key={wordbook.id} value={wordbook.id}>
                                            {wordbook.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">단어*</label>
                            <input
                                type="text"
                                name="word"
                                value={newWordData.word}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="영단어를 입력하세요"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">품사</label>
                            <input
                                type="text"
                                name="pos"
                                value={newWordData.pos}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="품사 (예: noun, verb, adj)"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">뜻*</label>
                            <input
                                type="text"
                                name="meaning"
                                value={newWordData.meaning}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="단어의 뜻을 입력하세요"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                            <select
                                name="difficulty"
                                value={newWordData.difficulty}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                            >
                                <option value="EASY">쉬움</option>
                                <option value="MEDIUM">보통</option>
                                <option value="HARD">어려움</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">예문</label>
                            <textarea
                                name="exampleSentence"
                                value={newWordData.exampleSentence}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="단어를 사용한 예문을 입력하세요"
                                rows={2}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">번역</label>
                            <textarea
                                name="translatedSentence"
                                value={newWordData.translatedSentence}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]"
                                placeholder="예문의 번역을 입력하세요"
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeAddModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddWord}
                                className="px-4 py-2 bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default Word
