import {createBrowserRouter, Navigate} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";

import ProdutorDashboard from "./pages/producer/Dashboard";
import Produtos from "./pages/producer/Produtos";

import ClienteDashboard from "./pages/customer/Dashboard";
import Pedidos from "./pages/customer/Pedidos";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>,
    },
    {
        path: "/producer",
        element: <DashboardLayout userType="producer"/>,
        children: [
            {
                path: "dashboard",
                element: <ProdutorDashboard/>,
            },
            {
                path: "produtos",
                element: <Produtos/>,
            },
        ],
    },
    {
        path: "/customer",
        element: <DashboardLayout userType="customer"/>,
        children: [
            {
                path: "dashboard",
                element: <ClienteDashboard/>,
            },
            {
                path: "pedidos",
                element: <Pedidos/>,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/login"/>,
    },
]);