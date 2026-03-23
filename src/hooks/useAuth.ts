import {useState} from "react"
import {AuthService} from "../services"

const authService = new AuthService()

export function useAuth() {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)

    async function login(credentials) {
        const response = await authService.login(credentials)

        const data = response.data

        localStorage.setItem("token", data.accessToken)

        setUser(data.user)

        return data
    }


    function logout() {
        localStorage.removeItem("token")
        setUser(null)
    }

    return {
        login,
        logout,
        user,
        loading,
    }
}
