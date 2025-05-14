'use client'

import React, { useState, useEffect } from 'react'
import client from '@/lib/backend/client'
import { components } from '@/lib/backend/apiV1/schema'

type Wordbook = components['schemas']['WordbookResponse']
type AddWordToWordbookRequest = components['schemas']['AddWordToWordbookRequest']

export interface Keyword extends AddWordToWordbookRequest {
    meaning?: string
    difficulty?: number
}

export interface KeywordCardProps {
    keyword: Keyword
    position: { x: number; y: number }
    onClose: () => void
    onAddWord?: (word: Keyword) => void
    onRemoveWord?: (word: Keyword) => void
    isAdded?: boolean
}

const KeywordCard: React.FC<KeywordCardProps> = ({
    keyword,
    position,
    onClose,
    onAddWord,
    onRemoveWord,
    isAdded: initialIsAdded = false,
}) => {
    const [isAdded, setIsAdded] = useState(initialIsAdded)
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // isAdded prop이 변경되면 내부 상태도 업데이트
    useEffect(() => {
        setIsAdded(initialIsAdded)
    }, [initialIsAdded])

    const addWordToDefaultWordbook = async () => {
        try {
            setIsLoading(true)

            // 1. 단어장 목록 조회
            const wordbooksResponse = await client.GET('/api/v1/wordbooks', {})

            if (wordbooksResponse.error || !wordbooksResponse.data?.data) {
                throw new Error('단어장 목록 조회 실패')
            }

            const wordbooks = wordbooksResponse.data.data as Wordbook[]
            if (wordbooks.length === 0 || !wordbooks[0].id) {
                throw new Error('기본 단어장을 찾을 수 없습니다')
            }

            // 2. 첫 번째 단어장(기본 단어장)에 단어 추가
            const defaultWordbookId = wordbooks[0].id
            const response = await client.POST('/api/v1/wordbooks/{wordbookId}/words', {
                params: {
                    path: {
                        wordbookId: defaultWordbookId,
                    },
                },
                body: {
                    words: [
                        {
                            word: keyword.word,
                            subtitleId: keyword.subtitleId,
                            videoId: keyword.videoId,
                        },
                    ],
                },
            })

            if (response.error) {
                throw new Error('단어 추가 실패')
            }

            // 성공 시 상태 업데이트 및 콜백 호출
            setIsLoading(false) // 로딩 상태 먼저 해제
            setIsAdded(true)
            setShowSuccess(true)
            if (onAddWord) {
                onAddWord(keyword)
            }

            // 충분한 시간 동안 성공 표시를 보여준 후 카드 닫기
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error('단어 추가 중 오류 발생:', error)
            alert('단어 추가에 실패했습니다.')
            setIsLoading(false)
        }
    }

    const handleAddWord = () => {
        if (!isAdded) {
            addWordToDefaultWordbook()
        }
    }

    const handleRemoveWord = () => {
        if (onRemoveWord && isAdded) {
            onRemoveWord(keyword)
            setIsAdded(false)
        }
    }

    return (
        <div
            className="fixed bg-white shadow-lg rounded-md p-4 w-64 border border-purple-300 z-10"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translateX(-50%)',
            }}
        >
            {/* 키워드 카드 헤더 */}
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-purple-800">{keyword.word}</span>
                <button
                    className="text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
                    onClick={isAdded ? handleRemoveWord : handleAddWord}
                    disabled={isLoading}
                    title={isAdded ? '단어장에서 제거하기' : '단어장에 추가하기'}
                >
                    {isLoading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                    ) : showSuccess ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : isAdded ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                </button>
            </div>
            <p className="text-gray-700">{keyword.meaning}</p>
        </div>
    )
}

export default KeywordCard
