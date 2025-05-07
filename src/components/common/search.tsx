'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SearchProps {
    placeholder?: string
    onSearch: (keyword: string) => void
}

export default function Search({ placeholder = 'search...', onSearch }: SearchProps) {
    const [keyword, setKeyword] = useState('')

    const handleSearch = () => {
        if (!keyword.trim()) return
        onSearch(keyword.trim())
    }

    return (
        <div className="flex items-center border-[3px] border-[var(--color-main)] bg-[var(--color-white)] rounded-full px-4 py-2 flex-1">
            <input
                type="text"
                placeholder={placeholder}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400"
            />
            <button onClick={handleSearch} className="text-[var(--color-main)]">
                <Image src="/assets/search.svg" alt="search" width={32} height={32} />
            </button>
        </div>
    )
}
