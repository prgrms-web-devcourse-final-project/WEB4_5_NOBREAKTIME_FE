import Card from '@/components/learning/card'
import Image from 'next/image'

interface Description {
    text: string
    strong: string[]
}

interface Wordbook {
    id: number
    name: string
    language: string
}

interface Props {
    title: string
    descriptions: Description[]
    wordbooks: Wordbook[]
    isLoading?: boolean
}

export default function LearningCard({ title, descriptions, wordbooks, isLoading = false }: Props) {
    return (
        <div className="flex gap-4 border border-[var(--color-main)] rounded-lg shadow-lg p-6">
            <Image src="/character/character-word.png" alt="word" width={300} height={300} />
            <div className="flex-1 m-auto">
                <h1 className="text-5xl font-bold mb-8">오늘 함께할 {title} 퀴즈는?</h1>

                {descriptions.map((desc, idx) => {
                    const replaced = desc.text.replace('{title}', title)
                    const regex = new RegExp(`(${desc.strong.join('|')})`, 'g')
                    const parts = replaced.split(regex)

                    return (
                        <p key={idx} className="text-2xl mb-2">
                            {parts.map((part, i) =>
                                desc.strong.includes(part) ? (
                                    <strong key={i} className="text-[var(--color-point)] text-3xl">
                                        {part}
                                    </strong>
                                ) : (
                                    <span key={i}>{part}</span>
                                ),
                            )}
                        </p>
                    )
                })}
            </div>

            <Card wordbooks={wordbooks} isLoading={isLoading} />
        </div>
    )
}
