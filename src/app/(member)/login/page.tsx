'use client'

import Footer from '@/components/layout/footer'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import client from '@/lib/backend/client'

function Login() {
    const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`
    const socialLoginForNaverUrl = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/naver`
    const socialLoginForGoogleUrl = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`
    const redirectUrlAfterSocialLogin = process.env.NEXT_PUBLIC_FRONT_BASE_URL

    const router = useRouter()

    const handleGoHome = () => {
        router.push('/')
    }

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // 현재 로그인된 회원 정보 가져오기
                const response = await client.GET('/api/v1/members/me');
                console.log('회원 정보:', response);
                if (response) {
                    // 이미 로그인된 상태라면 대시보드 페이지로 리다이렉트
                    router.push('/dashboard');
                }
            } catch (error: any) {
                if (error?.status === 409) {
                    alert(error?.data?.message || '탈퇴 후 재가입 기간이 지나지 않아 가입할 수 없습니다.');
                    router.push('/');
                } else {
                    console.error('API 호출 실패:', error);
                    alert('네트워크 오류가 발생했습니다.');
                }
            }
        }

        fetchUserInfo();
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Link href="/">
                <Image src="/logo/all-logo.svg" alt="logo" width={180} height={180} className="ml-10 mt-5" />
            </Link>
            <div className="flex-1 flex flex-col items-center gap-24 pt-30 p-12 m-auto">
                <h1 className="text-5xl font-bold w-full text-center">Login</h1>

                <div className="flex flex-col gap-4 w-full max-w-[360px]">
                    {/* Kakao Login */}
                    <Link
                        href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-[#FFEB3B] text-black rounded-sm shadow"
                    >
                        <Image src="/logo/kakao-icon.svg" alt="kakao" width={24} height={24} />
                        <span className="text-base font-medium">카카오 1초 안에 시작하기</span>
                    </Link>

                    {/* Naver Login */}
                    <Link
                        href={`${socialLoginForNaverUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-[#03C75A] text-white rounded-sm shadow"
                    >
                        <Image src="/logo/naver.png" alt="naver" width={24} height={24} />
                        <span className="text-base font-medium">네이버 1초 안에 시작하기</span>
                    </Link>

                    {/* Google Login */}
                    <Link
                        href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="flex items-center justify-center gap-2 h-12 w-full bg-white border border-gray-300 text-black rounded-sm shadow"
                    >
                        <Image src="/logo/google.png" alt="google" width={20} height={20} />
                        <span className="text-base font-medium ml-2">구글 1초 안에 시작하기</span>
                    </Link>

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
