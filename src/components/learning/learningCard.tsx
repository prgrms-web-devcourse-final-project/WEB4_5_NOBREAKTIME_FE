import Card from '@/components/learning/card'

interface Description {
    text: string
    strong: string[]
}

interface Props {
    title: string
    descriptions: Description[]
}
export default function LearningCard({ title, descriptions }: Props) {
    return (
        <div className="flex gap-4 border border-[var(--color-main)] rounded-lg shadow-lg p-6">
            <img src="/character/character-word.png" alt="word" className="w-70 h-60" />
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

            <Card />
        </div>
    )
}
