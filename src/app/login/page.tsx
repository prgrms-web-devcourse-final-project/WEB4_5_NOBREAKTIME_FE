'use client'

import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/footer'

function Login() {
    const router = useRouter()

    const handleKakaoLogin = () => {
        console.log('카카오 로그인 시도')
        // TODO: Kakao OAuth API 연동
        router.push('/language')
    }

    const handleNaverLogin = () => {
        console.log('네이버 로그인 시도')
        // TODO: Naver OAuth API 연동
        router.push('/language')
    }

    const handleGoogleLogin = () => {
        console.log('구글 로그인 시도')
        // TODO: Google OAuth API 연동
        router.push('/language')
    }

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div className="flex flex-col h-screen">
            <img src="/logo/all-logo.svg" alt="logo" className="w-45 ml-10 mt-5" />

            <div className="flex-1 flex flex-col items-center gap-24 pt-30 p-12 m-auto">
                <h1 className="text-5xl font-bold w-full text-center">Login</h1>

                <div className="flex flex-col gap-4 w-full max-w-[360px]">
                    {/* Kakao Login */}
                    <button
                        onClick={handleKakaoLogin}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-[#FFEB3B] text-black rounded-sm shadow"
                    >
                        <img src="/logo/kakao-icon.svg" alt="kakao" className="w-6 h-6" />
                        <span className="text-base font-medium">카카오 1초 안에 시작하기</span>
                    </button>

                    {/* Naver Login */}
                    <button
                        onClick={handleNaverLogin}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-[#03C75A] text-white rounded-sm shadow"
                    >
                        <img src="/logo/naver.png" alt="naver" className="h-8" />
                        <span className="text-base font-medium">네이버 1초 안에 시작하기</span>
                    </button>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-white border border-gray-300 text-black rounded-sm shadow"
                    >
                        <img src="/logo/google.png" alt="google" className="w-6 h-6" />
                        <span className="text-base font-medium">구글 1초 안에 시작하기</span>
                    </button>

                    {/* Home Button */}
                    <button
                        onClick={handleGoHome}
                        className="w-full h-12 bg-[var(--color-sub-2)] text-[var(--color-black)] rounded-sm"
                    >
                        메인 페이지로 돌아가기
                    </button>

                    {/* 약관 안내 */}
                    <p className="text-sm text-center mt-2">
                        로그인 시 <strong className="text-[var(--color-point)]">이용약관</strong>과{' '}
                        <strong className="text-[var(--color-point)]">개인정보보호정책</strong>에 동의하게 됩니다.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Login
