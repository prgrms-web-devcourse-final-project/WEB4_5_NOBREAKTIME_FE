import Image from 'next/image'

export default function LearningHistory() {
    const learningHistory = [
        { id: 'total', icon: '/assets/time.svg', time: '2h 12m' },
        { id: 'video', icon: '/assets/fluent_video.svg', time: '1h 30m' },
        { id: 'word', icon: '/assets/tabler_abc.svg', time: '30m' },
        { id: 'quiz', icon: '/assets/quiz.svg', time: '12m' },
    ]

    return (
        <div className="flex flex-col space-y-2 text-xs">
            <h3 className="text-lg">Today</h3>
            <div className="grid grid-cols-2 gap-4 w-full h-full flex-1">
                {learningHistory.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col items-center gap-2 bg-[var(--color-sub-2)] p-5 rounded-lg p-2"
                    >
                        <Image src={item.icon} alt={item.id} width={50} height={50} />
                        <span className="text-[var(--color-black)] text-lg font-bold">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
