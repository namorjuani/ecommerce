// src/context/TiendaContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface TiendaData {
    nombre: string;
    descripcion: string;
    imagen: string;
    logo: string;
    whatsapp: string;
    textoHero: string;
    colorFondo: string;
    colorBoton: string;
    linkInstagram: string;
    linkFacebook: string;
    googleMaps: string;
    textoUbicacion: string;
    categoriaDestacada1: string;
    categoriaDestacada2: string;
    alturaBanner: string;
    posicionBanner: string;
    tamañoBanner: string;
}

const TiendaContext = createContext<TiendaData | null>(null);

export const useTienda = () => useContext(TiendaContext);

export function TiendaProvider({ children }: { children: React.ReactNode }) {
    const [tienda, setTienda] = useState<TiendaData | null>(null);

    useEffect(() => {
        const tiendaId =
            localStorage.getItem("userId") || "d5gnEacrofgn8NxTOdRgwzZRow73";
        const ref = doc(db, "tiendas", tiendaId);

        const unsubscribe = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const data = snap.data() as TiendaData;
                setTienda(data);
                // Aplicamos color de fondo dinámico
                if (data.colorFondo) {
                    document.documentElement.style.setProperty("--color-fondo", data.colorFondo);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return <TiendaContext.Provider value={tienda}>{children}</TiendaContext.Provider>;
}
