import {useState} from "react";
import {Link, Outlet} from "react-router-dom";
import {useAuth} from "@/contexts/AuthContext";

interface DashboardLayoutProps {
    userType: "producer" | "customer";
}

export default function DashboardLayout({userType}: DashboardLayoutProps) {
    const {logout, user} = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const produtorLinks = [
        {name: "Dashboard", path: "dashboard"},
        {name: "Produtos", path: "produtos"},
    ];

    const clienteLinks = [
        {name: "Dashboard", path: "dashboard"},
        {name: "Pedidos", path: "pedidos"},
    ];

    const links = userType === "producer" ? produtorLinks : clienteLinks;

    return (
        <div style={{display: "flex", minHeight: "100vh"}}>
            {/* Sidebar */}
            <aside
                style={{
                    width: "250px",
                    background: "#1e293b",
                    color: "#fff",
                    padding: "20px",
                }}
            >
                <h2>Minha App</h2>

                <nav>
                    {links.map((link) => (
                        <div key={link.path} style={{margin: "10px 0"}}>
                            <Link
                                to={link.path}
                                style={{color: "#fff", textDecoration: "none"}}
                            >
                                {link.name}
                            </Link>
                        </div>
                    ))}
                </nav>

                <button
                    onClick={logout}
                    style={{
                        marginTop: "20px",
                        padding: "8px",
                        background: "#ef4444",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    Sair
                </button>
            </aside>

            {/* Conteúdo */}
            <main style={{flex: 1, padding: "20px"}}>
                <h3>Bem-vindo, {user?.name}</h3>
                <Outlet/>
            </main>
        </div>
    );
}
