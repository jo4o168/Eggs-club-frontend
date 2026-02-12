import React, {useState} from 'react'
import {api} from '../../api/http.ts'
import DefaultLayout from "../../layouts/DefaultLayout.tsx";
import {AuthService} from "../../services";

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const {login} = AuthService()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await api.post('/auth/login', {
                email,
                password,
            })

            alert('Login realizado com sucesso')
        } catch {
            setError('Email ou senha inválidos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DefaultLayout>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                {error && <p>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </DefaultLayout>
    )
}

export default Login
