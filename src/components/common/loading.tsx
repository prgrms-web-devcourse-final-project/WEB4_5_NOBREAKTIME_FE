export default function Loading() {
    return (
        <div className="h-screen flex-1 flex justify-center items-center">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-sub-2)] rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-point)] rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    )
}
