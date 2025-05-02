'use client'

import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/footer'

function Login() {
    const router = useRouter()

    const handleKakaoLogin = () => {
        // TODO: 카카오 로그인 연동 API 호출
        console.log('카카오 로그인 시도')

        // 로그인 후 언어 선택 페이지로 이동
        router.push('/language')
    }

    const handleGoHome = () => {
        router.push('/')
        // console.log('메인으로 이동')
    }

    return (
        <div className="flex flex-col h-screen">
            <img src="/logo/all-logo.svg" alt="logo" className="w-45 ml-10 mt-5" />
            <div className="flex-1 flex flex-col items-center gap-30 pt-30 p-12 m-auto">
                <h1 className="text-5xl font-bold w-full text-center">Login</h1>
                <div className="flex flex-col gap-8">
                    <button
                        onClick={handleKakaoLogin}
                        className="flex items-center h-12 justify-center gap-2 w-full text-center bg-[#FFEB3B] text-[var(--color-balck)] rounded-sm py-2"
                    >
                        <img src="/logo/kakao-icon.svg" alt="kakao" />
                        카카오 1초 안에 시작하기
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="w-full h-12 text-center bg-[var(--color-sub-2)] text-[var(--color-balck)] rounded-sm py-2"
                    >
                        메인 페이지로 돌아가기
                    </button>

                    <p>
                        로그인 시 <strong className="text-[var(--color-point)]">이용약관</strong>과
                        <strong className="text-[var(--color-point)]">개인정보보호정책</strong>에 동의하게 됩니다.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Login
