import axios from 'axios'

const http = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
})

http.interceptors.request.use(config => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

http.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Não autorizado')
        }

        return Promise.reject(error)
    }
)

export default http
