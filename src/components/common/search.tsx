'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SearchProps {
    placeholder?: string
    onSearch: (keyword: string) => void
}

export default function Search({ placeholder = 'search...', onSearch }: SearchProps) {
    const [keyword, setKeyword] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value
        setKeyword(newKeyword)
        onSearch(newKeyword.trim())
    }

    const clearSearch = () => {
        setKeyword('')
        onSearch('')
    }

    return (
        <div className="flex items-center border-[3px] border-[var(--color-main)] bg-[var(--color-white)] rounded-full px-4 py-2 flex-1">
            <input
                type="text"
                placeholder={placeholder}
                value={keyword}
                onChange={handleInputChange}
                className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400"
            />
            {keyword && (
                <button onClick={clearSearch} className="text-gray-400 mr-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            <Image src="/assets/search.svg" alt="search" width={32} height={32} className="text-[var(--color-main)]" />
        </div>
    )
}
