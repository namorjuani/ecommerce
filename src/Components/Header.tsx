import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCliente } from "../context/ClienteContext";
import BarraBusqueda from "./BarraBusqueda";
import BotonCarritoHeader from "./BotonCarritoHeader";

interface Props {
    logo: string;
    nombre: string;
    imagenBanner: string;
    alturaBanner: string;
    posicionBanner: string;
    tamañoBanner: string;
    categoria1: string;
    categoria2: string;
    categoriasExtras: string[];
    setCategoriaFiltrada?: (cat: string | null) => void;
    linkInstagram: string;
    linkFacebook: string;
}

export default function Header({
    logo,
    nombre,
    imagenBanner,
    alturaBanner,
    posicionBanner,
    tamañoBanner,
    categoria1,
    categoria2,
    categoriasExtras,
    setCategoriaFiltrada,
    linkInstagram,
    linkFacebook,
}: Props) {
    const { cliente, iniciarSesion, cerrarSesion } = useCliente();
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [mostrarMasCategorias, setMostrarMasCategorias] = useState(false);
    const navigate = useNavigate();

    return (
        
        <div  className="header-container" style={{ position: "sticky", top: 0, zIndex: 999, backgroundColor: "#fff" }}>
            
            {/* Banner */}
            <div
                style={{
                    backgroundImage: `url(${imagenBanner})`,
                    backgroundPosition: posicionBanner,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: tamañoBanner,
                    borderBottom: "1px solid rgba(0, 0, 0, .1)",
                    height: alturaBanner,
                    position: "relative",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 12px",
                        height: "60px",
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        gap: "10px",
                    }}
                >
                    <img src={logo || "/logo.png"} alt="Logo" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "contain" }} />
                    <span style={{ fontWeight: 600 }}>{nombre}</span>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
                        alt="verificado"
                        style={{ width: 18, height: 18, marginLeft: 4 }}
                    />
                </div>
            </div>
            <BarraBusqueda />
            {/* Nav categorías + redes + perfil */}
            <div
                style={{
                    backgroundColor: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 20px",
                    borderBottom: "1px solid #eee",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
            >
                {/* Categorías */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ cursor: "pointer" }} onClick={() => setCategoriaFiltrada?.(null)}>Inicio</span>
                    <span style={{ cursor: "pointer" }} onClick={() => setCategoriaFiltrada?.(categoria1)}>{categoria1}</span>
                    <span style={{ cursor: "pointer" }} onClick={() => setCategoriaFiltrada?.(categoria2)}>{categoria2}</span>

                    <div style={{ position: "relative" }}>
                        <span
                            onClick={() => setMostrarMasCategorias(!mostrarMasCategorias)}
                            style={{ cursor: "pointer" }}
                        >
                            Más categorías ▼
                        </span>
                        {mostrarMasCategorias && (
                            <div
                                style={{
                                    position: "absolute",
                                    backgroundColor: "#fff",
                                    top: "25px",
                                    left: 0,
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    padding: "8px",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                    zIndex: 999,
                                }}
                            >
                                {categoriasExtras.map((cat) => (
                                    
                                    <div
                                        key={cat}
                                        style={{ cursor: "pointer", padding: "4px 0" }}
                                        onClick={() => {
                                            setCategoriaFiltrada?.(cat);
                                            setMostrarMasCategorias(false);
                                        }}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Redes + compartir + perfil */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Facebook e Instagram */}
                    {linkFacebook && (
                        <a href={linkFacebook} target="_blank" rel="noreferrer">
                            <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" alt="fb" style={{ width: 20 }} />
                        </a>
                    )}
                    {linkInstagram && (
                        <a href={linkInstagram} target="_blank" rel="noreferrer">
                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="ig" style={{ width: 20 }} />
                        </a>
                    )}

                    {/* Compartir */}
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            if (navigator.share) navigator.share({ url });
                            else {
                                navigator.clipboard.writeText(url);
                                alert("Enlace copiado al portapapeles");
                            }
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/929/929610.png"
                            alt="Compartir"
                            style={{ width: 20 }}
                        />
                    </button>

                    {/* Carrito visible siempre */}
                    <BotonCarritoHeader />

                    {/* Perfil */}
                    {cliente ? (
                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setMostrarMenu(!mostrarMenu)}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    backgroundColor: "#ddd",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {cliente.photoURL ? (
                                    <img
                                        src={cliente.photoURL}
                                        alt="Perfil"
                                        style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                                    />
                                ) : (
                                    <span>
                                        {cliente.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {mostrarMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "45px",
                                        right: 0,
                                        backgroundColor: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        zIndex: 999,
                                    }}
                                >
                                    <button onClick={() => navigate("/historial")}>🧾 Historial</button>
                                    <button onClick={() => navigate("/datos-envio")}>📦 Datos de envío</button>
                                    <button onClick={cerrarSesion}>🚪 Cerrar sesión</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={iniciarSesion} style={{ padding: "0.4rem 0.8rem" }}>
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </div>

            {/* Buscador */}

        </div>
    );
}
