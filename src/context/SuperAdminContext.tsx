// src/context/SuperAdminContext.tsx
import { createContext, useContext, useState } from "react";

interface SuperAdminContextType {
    autorizado: boolean;
    verificarPIN: (pin: string) => boolean;
}

const SuperAdminContext = createContext<SuperAdminContextType>({
    autorizado: false,
    verificarPIN: () => false,
});

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
    const [autorizado, setAutorizado] = useState(false);

    const verificarPIN = (pin: string) => {
        if (pin === "1234") {  // 👉 CAMBIALO POR TU PIN REAL
            setAutorizado(true);
            return true;
        }
        return false;
    };

    return (
        <SuperAdminContext.Provider value={{ autorizado, verificarPIN }}>
            {children}
        </SuperAdminContext.Provider>
    );
}

export const useSuperAdmin = () => useContext(SuperAdminContext);
