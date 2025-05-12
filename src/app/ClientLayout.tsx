'use client'

import Loading from '@/components/common/loading'
import client from '@/lib/backend/client'
import { LoginMemberContext, useLoginMember } from '@/stores/auth/loginMember'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export function ClientLayout({ children }: React.ComponentProps<typeof NextThemesProvider>) {
    const { loginMember, setLoginMember, isLoginMemberPending, setNoLoginMember, isLogin, logout, logoutAndHome } =
        useLoginMember()
    const router = useRouter()

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
    }, [])

    if (isLoginMemberPending) {
        return <Loading />
    }

    // if (loginMember.language === 'NONE') {
    //     router.push('/additional_info')
    // }

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
