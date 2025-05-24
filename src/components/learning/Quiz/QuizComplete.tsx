import Image from 'next/image'
import WordIcon from '../../icon/wordIcon'
import ExpressionIcon from '../../icon/expressionIcon'
import { useRouter } from 'next/navigation'

interface QuizCompleteProps {
    quizType: 'word' | 'expression'
    score: number
    totalCount: number
    incorrectCount: number
    onResetQuiz: () => void
    onRestartQuiz: () => void
}

export default function QuizComplete({
    quizType,
    score,
    totalCount,
    incorrectCount,
    onResetQuiz,
    onRestartQuiz,
}: QuizCompleteProps) {
    const router = useRouter()

    const handleGoToMenu = () => {
        if (quizType === 'word') {
            router.push('/dashboard/word/learning')
        } else {
            router.push('/dashboard/expression/learning')
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-[var(--color-main)]">
                    {quizType === 'word' ? <WordIcon /> : <ExpressionIcon />}
                </span>
                <h3 className="text-2xl font-bold text-[var(--color-black)]">
                    {quizType === 'word' ? 'Word Quiz' : 'Expression Quiz'}
                </h3>
            </div>
            <div className="bg-image p-20 flex flex-col items-center justify-center gap-8">
                <h1 className="text-6xl font-bold text-[var(--color-main)]">Complete!</h1>
                <div className="text-2xl text-red-500 font-bold">
                    {score} / {totalCount}
                </div>
                <Image src="/assets/ok.svg" alt="complete" width={80} height={80} />
                <p className="text-xl text-gray-600">테스트를 완료했어요</p>
                {incorrectCount > 0 ? (
                    <>
                        <p className="text-lg text-gray-500">틀린 문제 {incorrectCount}개를 다시 풀어볼까요?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={onResetQuiz}
                                className="px-6 py-3 bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-all"
                            >
                                틀린 문제만 다시 풀기
                            </button>
                            <button
                                onClick={onRestartQuiz}
                                className="px-6 py-3 border-2 border-[var(--color-main)] text-[var(--color-main)] rounded-md hover:bg-[var(--color-main)] hover:text-white transition-all"
                            >
                                처음부터 다시 풀기
                            </button>
                            <button
                                onClick={handleGoToMenu}
                                className="px-6 py-3 bg-[var(--color-point)] text-[var(--color-black)] rounded-md hover:bg-opacity-90 transition-all"
                            >
                                메뉴로 가기
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-gray-500">모든 문제를 맞추셨네요! 축하합니다!</p>
                        <div className="flex gap-4">
                            <button
                                onClick={onRestartQuiz}
                                className="px-6 py-3 bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-all"
                            >
                                처음부터 다시 풀기
                            </button>
                            <button
                                onClick={handleGoToMenu}
                                className="px-6 py-3 bg-[var(--color-point)] text-[var(--color-black)] rounded-md hover:bg-opacity-90 transition-all"
                            >
                                메뉴로 가기
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
