import { createBrowserRouter } from 'react-router-dom'
import Login from "./pages/auth/Login.tsx";

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
])
