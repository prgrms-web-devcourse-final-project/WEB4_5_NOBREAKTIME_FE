import Image from 'next/image'

export default function ExpressionCard() {
    return (
        <div className="flex flex-wrap gap-4">
            {Array.from({ length: 20 }).map((_, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between p-4 w-[32%] h-[180px] bg-[var(--color-white)] rounded-lg border border-2 border-[var(--color-main)]"
                >
                    <div className="flex justify-between">
                        <div>⭐</div>
                        <button>
                            <Image src="/assets/close.svg" alt="card delete" width={24} height={24} />
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-center">I abandoned my plan.</p>
                    <p className="text-md text-center">나는 내 계획을 버렸다.</p>
                </div>
            ))}
        </div>
    )
}
