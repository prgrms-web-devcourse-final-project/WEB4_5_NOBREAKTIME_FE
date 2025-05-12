import { useRouter } from 'next/navigation'
import { createContext, use, useState } from 'react'

type UserProfileResponse = {
    email?: string
    nickname?: string
    profileImage?: string
    subscriptionType?: 'NONE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ADMIN'
    language?: 'ENGLISH' | 'JAPANESE' | 'NONE'
}

export const LoginMemberContext = createContext<{
    loginMember: UserProfileResponse
    setLoginMember: (member: UserProfileResponse) => void
    isLoginMemberPending: boolean
    isLogin: boolean
    logout: (callback: () => void) => void
    logoutAndHome: () => void
}>({
    loginMember: {
        email: '',
        nickname: '',
        profileImage: '',
        subscriptionType: 'NONE',
        language: 'NONE',
    },
    setLoginMember: () => {},
    isLoginMemberPending: true,
    isLogin: false,
    logout: () => {},
    logoutAndHome: () => {},
})

function createEmptyMember(): UserProfileResponse {
    return {
        email: '',
        nickname: '',
        profileImage: '',
        subscriptionType: 'NONE',
        language: 'NONE',
    }
}

export function useLoginMember() {
    const router = useRouter()

    const [isLoginMemberPending, setLoginMemberPending] = useState(true)
    const [loginMember, _setLoginMember] = useState<UserProfileResponse>({
        email: '',
        nickname: '',
        profileImage: '',
        subscriptionType: 'NONE',
        language: 'NONE',
    })

    const removeLoginMember = () => {
        _setLoginMember(createEmptyMember())
        setLoginMemberPending(false)
    }

    const setLoginMember = (member: UserProfileResponse) => {
        _setLoginMember(member)
        setLoginMemberPending(false)
    }

    const setNoLoginMember = () => {
        setLoginMemberPending(false)
    }

    const isLogin = loginMember.email !== undefined

    const logout = (callback: () => void) => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/members/logout`, {
            method: 'GET',
            credentials: 'include',
        }).then(() => {
            removeLoginMember()
            callback()
        })
    }

    const logoutAndHome = () => {
        logout(() => router.replace('/'))
    }

    return {
        loginMember,
        setLoginMember,
        isLoginMemberPending,
        setNoLoginMember,
        isLogin,
        logout,
        logoutAndHome,
    }
}

export function useGlobalLoginMember() {
    return use(LoginMemberContext)
}
