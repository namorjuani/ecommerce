// src/adminSistema/components/SolicitarPin.tsx
import { useState } from "react";
import { useSuperAdmin } from "../../context/SuperAdminContext";

export default function SolicitarPin({ children }: { children: React.ReactNode }) {
    const { autorizado, verificarPIN } = useSuperAdmin();
    const [pin, setPin] = useState("");

    if (autorizado) return <>{children}</>;

    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h2>🔐 Ingresá tu clave de administrador</h2>
            <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN secreto"
                style={{ padding: "0.5rem", fontSize: "1rem", width: "200px" }}
            />
            <br />
            <button
                onClick={() => {
                    if (!verificarPIN(pin)) alert("PIN incorrecto");
                }}
                style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
            >
                Ingresar
            </button>
        </div>
    );
}
