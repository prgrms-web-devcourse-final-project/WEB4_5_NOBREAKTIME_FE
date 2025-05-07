import React from 'react'

export default function LevelBox() {
    const userLevel = {
        video: 'S',
        word: 'A',
        grammar: 'B',
        quiz: 'D',
        date: '2025-04-25 18:42',
    }

    const commonColor = 'text-[var(--color-success)]'

    const levelColor: Record<string, string> = {
        S: 'text-[var(--color-point)]',
        A: 'text-[var(--color-main)]',
        B: commonColor,
        C: commonColor,
        D: 'text-[var(--color-warning)]',
    }

    const categories = [
        { label: '영상', key: 'video' },
        { label: '단어', key: 'word' },
        { label: '문법', key: 'grammar' },
        { label: '퀴즈', key: 'quiz' },
    ]

    return (
        <div className="flex flex-col gap-8 mb-8 ">
            <div className="flex justify-between text-sm">
                {categories.map(({ label, key }) => {
                    const level = userLevel[key as keyof typeof userLevel]
                    return (
                        <React.Fragment key={key}>
                            <div className="flex flex-1 justify-center gap-8 items-center">
                                <span className="text-lg">{label}</span>
                                <span className={`${levelColor[level]} text-3xl font-bold`}>{level}</span>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>
            <button className="flex flex-col items-center m-auto text-sm text-[var(--color-white)] w-[200px] bg-[var(--color-warning)] rounded-full px-2 py-1">
                레벨 재측정기준
                <small>{userLevel.date}</small>
            </button>
        </div>
    )
}
