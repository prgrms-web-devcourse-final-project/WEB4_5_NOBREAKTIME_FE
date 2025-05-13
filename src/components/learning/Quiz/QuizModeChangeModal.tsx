interface QuizModeChangeModalProps {
    onCancel: () => void
    onConfirm: () => void
}

export default function QuizModeChangeModal({ onCancel, onConfirm }: QuizModeChangeModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 블러 처리된 배경 */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white p-8 rounded-lg max-w-md w-full mx-4 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[var(--color-black)]">모드 변경 확인</h3>
                <p className="text-gray-600 mb-6">
                    모드를 변경하면 현재까지의 진행 상황이 초기화되고 처음부터 다시 시작해야 합니다. 계속하시겠습니까?
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[var(--color-main)] text-white rounded hover:bg-opacity-90 transition-all"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    )
}
