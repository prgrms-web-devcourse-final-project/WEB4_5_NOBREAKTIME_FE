'use client'

import React, { useState, useEffect } from 'react'
import { Keyword } from '@/types/video'
interface KeywordCardProps {
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

    // isAdded prop이 변경되면 내부 상태도 업데이트
    useEffect(() => {
        setIsAdded(initialIsAdded)
    }, [initialIsAdded])

    const handleAddWord = () => {
        if (onAddWord && !isAdded) {
            onAddWord(keyword)
            setIsAdded(true)
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
                    className="text-purple-600 font-bold hover:text-purple-800"
                    onClick={isAdded ? handleRemoveWord : handleAddWord}
                    title={isAdded ? '단어장에서 제거하기' : '단어장에 추가하기'}
                >
                    {isAdded ? (
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
export type { Keyword, KeywordCardProps }
