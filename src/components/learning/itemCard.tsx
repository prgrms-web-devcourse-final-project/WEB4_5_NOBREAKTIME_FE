export default function ItemCard() {
    return (
        <div className="flex flex-wrap gap-4">
            {Array.from({ length: 20 }).map((_, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between p-4 w-[320px] h-[180px] bg-[var(--color-white)] rounded-lg border border-2 border-[var(--color-main)]"
                >
                    <div className="flex justify-between">
                        <div>⭐</div>
                        <button>
                            <img src="/assets/close.svg" alt="card delete" />
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-center">wonder</p>
                    <button className="flex items-center gap-2 justify-center">
                        <img src="/assets/volume.svg" alt="volume" />
                        <span>경이, 놀라움</span>
                    </button>
                    <p className="text-sm text-center">1. 경탄할만한 것</p>
                </div>
            ))}
        </div>
    )
}
