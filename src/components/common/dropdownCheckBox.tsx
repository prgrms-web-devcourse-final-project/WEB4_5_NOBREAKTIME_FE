'use client'

import { useEffect, useRef, useState } from 'react'

export default function DropdownCheckBox() {
    const [isOpen, setIsOpen] = useState(false)
    const [checkedItems, setCheckedItems] = useState({
        '새로운 단어장': false,
        '영화 단어장': false,
        '드라마 단어장': false,
        '노래 단어장': false,
    })

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOut = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOut)
        return () => {
            document.removeEventListener('mousedown', handleClickOut)
        }
    }, [])

    const handleCheckboxChange = (key: keyof typeof checkedItems) => {
        setCheckedItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    id="menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    단어장 선택
                    <svg
                        className="-mr-1 size-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex={-1}
                >
                    <div className="py-1" role="none">
                        {Object.entries(checkedItems).map(([label, checked]) => (
                            <label
                                key={label}
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                role="menuitem"
                            >
                                <span>{label}</span>

                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleCheckboxChange(label as keyof typeof checkedItems)}
                                    className="sr-only"
                                />

                                <span
                                    className={`w-5 h-5 flex items-center justify-center rounded border border-[var(--color-main)] ${
                                        checked ? 'bg-[var(--color-main)] text-white' : 'bg-white'
                                    }`}
                                >
                                    {checked && (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
