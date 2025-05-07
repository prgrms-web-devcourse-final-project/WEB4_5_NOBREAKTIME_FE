import Image from 'next/image'

type HeaderProps = {
    userName: string
    userLevel: number
}

export default function Header({ userName, userLevel }: HeaderProps) {
    return (
        <header className="flex items-center justify-end h-16 px-6">
            <div className="flex items-center gap-4">
                {/* 프로필 아이콘 */}
                <div className="w-10 h-10 rounded-full bg-[var(--color-main)] flex items-center justify-center">
                    <Image src="/assets/user.svg" alt="user" width={40} height={40} />
                </div>

                {/* 이름 + 레벨 + 드롭다운 */}
                <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800">{userName}</span>
                    <span className="text-sm text-gray-500">Lv. {userLevel}</span>
                    <button>
                        <Image src="/assets/bottmBTN.svg" alt="dropdown" width={24} height={24} />
                    </button>
                </div>
            </div>
        </header>
    )
}
