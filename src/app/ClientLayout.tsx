'use client'

import Loading from '@/components/common/loading'
import client from '@/lib/backend/client'
import { LoginMemberContext, useLoginMember } from '@/stores/auth/loginMember'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export function ClientLayout({ children }: React.ComponentProps<typeof NextThemesProvider>) {
    const { loginMember, setLoginMember, isLoginMemberPending, setNoLoginMember, isLogin, logout, logoutAndHome } =
        useLoginMember()
    const router = useRouter()
    const pathname = usePathname()

    const loginMemberContextValue = {
        loginMember,
        setLoginMember,
        isLoginMemberPending,
        setNoLoginMember,
        isLogin,
        logout,
        logoutAndHome,
    }

    const fetchMember = () => {
        client
            .GET('/api/v1/members/me')
            .then((res: any) => {
                if (res.error) {
                    console.log(res.error)
                    // 로그인되지 않은 상태로 처리
                    setNoLoginMember()
                } else {
                    console.log(res.data.data)
                    setLoginMember(res.data.data)
                }
            })
            .catch((error) => {
                // 에러 발생 시 (302 포함) 로그인되지 않은 상태로 처리
                setNoLoginMember()
            })
    }

    useEffect(() => {
        fetchMember()
        // 언어 미설정시 설정페이로
        if (isLogin && loginMember.language === 'NONE') {
            router.push('/additional_info')
        }
    }, [])

    if (isLoginMemberPending) {
        return <Loading />
    }

    // 메인, 로그인페이지 제외 모든 페이지 로그인 상태 확인
    const isPublicPath = ['/', '/login'].includes(pathname)
    if (!isLogin && !isPublicPath) {
        router.push('/login')
    }

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
            <LoginMemberContext value={loginMemberContextValue}>
                <main>{children}</main>
            </LoginMemberContext>
        </NextThemesProvider>
    )
}
