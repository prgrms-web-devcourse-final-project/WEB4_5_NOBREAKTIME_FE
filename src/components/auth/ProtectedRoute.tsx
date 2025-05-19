'use client'

import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLogin, isLoginMemberPending } = useGlobalLoginMember()
    const router = useRouter()

    useEffect(() => {
        if (!isLoginMemberPending && !isLogin) {
            router.push('/login')
        }
    }, [isLogin, isLoginMemberPending, router])

    if (isLoginMemberPending) {
        return null // 또는 로딩 컴포넌트를 표시할 수 있습니다
    }

    if (!isLogin) {
        return null
    }

    return <>{children}</>
}
