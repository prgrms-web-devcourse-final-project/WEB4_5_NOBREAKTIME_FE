'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/app/dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'

const wordList = [
    {
        word: 'abandon',
        meaning: '버리다',
        meanings: '포기하다, 버려두다, 떠나다',
        example: 'He abandoned his car in the snow.',
        exampleMeaning: '그는 눈 속에 차를 버려두었다.',
        stars: 2,
    },
    {
        word: 'benefit',
        meaning: '이익',
        meanings: '혜택, 이득',
        example: 'The project will benefit the community.',
        exampleMeaning: '이 프로젝트는 지역 사회에 이익이 될 것이다.',
        stars: 4,
    },
    {
        word: 'challenge',
        meaning: '도전',
        meanings: '난제, 어려운 문제',
        example: 'She accepted the challenge.',
        exampleMeaning: '그녀는 도전을 받아들였다.',
        stars: 1,
    },
    {
        word: 'develop',
        meaning: '개발하다',
        meanings: '발전시키다, 성장하다',
        example: 'The company developed a new app.',
        exampleMeaning: '회사는 새로운 앱을 개발했다.',
        stars: 3,
    },
    {
        word: 'enhance',
        meaning: '향상시키다',
        meanings: '개선하다, 강화하다',
        example: 'This feature enhances performance.',
        exampleMeaning: '이 기능은 성능을 향상시킨다.',
        stars: 5,
    },
    {
        word: 'focus',
        meaning: '집중하다',
        meanings: '초점을 맞추다, 주력하다',
        example: 'Try to focus on your work.',
        exampleMeaning: '일에 집중해보세요.',
        stars: 2,
    },
    {
        word: 'generate',
        meaning: '생성하다',
        meanings: '만들어내다, 일으키다',
        example: 'The engine generates power.',
        exampleMeaning: '엔진은 동력을 생성한다.',
        stars: 4,
    },
    {
        word: 'highlight',
        meaning: '강조하다',
        meanings: '부각시키다, 하이라이트',
        example: 'The speaker highlighted the key points.',
        exampleMeaning: '연설자는 핵심을 강조했다.',
        stars: 1,
    },
    {
        word: 'influence',
        meaning: '영향',
        meanings: '영향을 미치다, 작용하다',
        example: 'Parents influence their children.',
        exampleMeaning: '부모는 자녀에게 영향을 준다.',
        stars: 3,
    },
    {
        word: 'justify',
        meaning: '정당화하다',
        meanings: '변명하다, 해명하다',
        example: 'Can you justify your decision?',
        exampleMeaning: '당신의 결정을 정당화할 수 있나요?',
        stars: 5,
    },
]

export default function WordLearningPage() {
    const searchParams = useSearchParams()
    const selectedTitle = searchParams.get('title') || '제목 없음'

    const [index, setIndex] = useState(0)
    const wordItem = wordList.length
    const current = wordList[index]

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1)
    }

    const handleNext = () => {
        if (index < wordItem - 1) setIndex(index + 1)
    }

    function highlightWord(sentence: string, word: string) {
        const regex = new RegExp(`(${word})`, 'gi') // 대소문자 구분 없이
        const parts = sentence.split(regex)

        return parts.map((part, index) =>
            part.toLowerCase() === word.toLowerCase() ? (
                <strong key={index} className="text-[var(--color-point)] font-bold">
                    {part}
                </strong>
            ) : (
                <span key={index}>{part}</span>
            ),
        )
    }

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // 영어 발음
        speechSynthesis.speak(utterance)
    }

    return (
        <DashboardLayout
            title="Word Learning"
            icon={<WordIcon />}
            className="bg-image p-20 flex flex-col gap-4 items-center"
        >
            <h1 className="text-5xl font-bold text-[var(--color-black)]">{selectedTitle} 단어장 학습</h1>

            <div className="bg-[var(--color-main)] text-[var(--color-point)] px-4 py-2 rounded-sm">
                {index + 1} / {wordItem}
            </div>

            <div className="flex flex-col items-center justify-center bg-[var(--color-white)] w-180 h-full gap-8 p-12">
                <div className="text-yellow-400 text-xl">
                    {Array.from({ length: current.stars }).map((_, i) => (
                        <span key={i}>⭐</span>
                    ))}
                </div>

                <p className="text-5xl font-bold text-center">{current.word}</p>

                <button className="flex items-center gap-2 justify-center" onClick={() => speak(current.word)}>
                    <img src="/assets/volume.svg" alt="volume" />
                    <span className="text-lg">{current.meaning}</span>
                </button>

                <p className="text-lg text-center">{current.meanings}</p>

                <div>
                    <p className="text-md text-center">{highlightWord(current.example, current.word)}</p>

                    <p className="text-md text-center">{current.exampleMeaning}</p>
                </div>

                <div className="flex gap-2 w-full">
                    <button
                        onClick={handlePrev}
                        className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                        disabled={index === 0}
                    >
                        <img src="/assets/left.svg" alt="left" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 flex items-center justify-center bg-[var(--color-sub-2)] border-[var(--color-main)] border-2 rounded-sm disabled:opacity-50"
                        disabled={index === wordItem - 1}
                    >
                        <img src="/assets/right.svg" alt="right" />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}
