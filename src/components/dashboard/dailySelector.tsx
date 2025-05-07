'use client'

import React from 'react'

export default function DailySelector() {
    return (
        <div className="flex items-center gap-4 text-sm mb-6 w-full">
            <GoalItem label="영상" options={['10개', '20개', '30개']} />
            <GoalItem label="단어" options={['30개', '50개', '100개']} />
            <GoalItem label="퀴즈" options={['50개', '70개', '100개']} />
        </div>
    )
}

interface GoalItemProps {
    label: string
    options: string[]
}

function GoalItem({ label, options }: GoalItemProps) {
    return (
        <div className="flex flex-1 items-center gap-2">
            <span className="text-lg">{label}</span>
            <select className="px-2 py-1 rounded border flex-1 border-[var(--color-main)]">
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    )
}
