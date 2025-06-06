// src/context/StoreContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface StoreData {
    nombre: string;
    imagen: string;
    whatsapp: string;
    alturaBanner: string;
    posicionBanner: string;
    tamañoBanner: string;
    googleMaps: string;
    textoUbicacion: string;
    categoriaDestacada1: string;
    categoriaDestacada2: string;
    linkInstagram: string;
    linkFacebook: string;
}

const StoreContext = createContext<StoreData | null>(null);

export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [storeData, setStoreData] = useState<StoreData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const tiendaId = localStorage.getItem("userId") || "d5gnEacrofgn8NxTOdRgwzZRow73";
            const ref = doc(db, "tiendas", tiendaId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data() as StoreData;
                setStoreData({
                    nombre: data.nombre || "",
                    imagen: data.imagen || "",
                    whatsapp: data.whatsapp || "",
                    alturaBanner: data.alturaBanner || "100px",
                    posicionBanner: data.posicionBanner || "center",
                    tamañoBanner: data.tamañoBanner || "cover",
                    googleMaps: data.googleMaps || "",
                    textoUbicacion: data.textoUbicacion || "",
                    categoriaDestacada1: data.categoriaDestacada1 || "",
                    categoriaDestacada2: data.categoriaDestacada2 || "",
                    linkInstagram: data.linkInstagram || "",
                    linkFacebook: data.linkFacebook || "",
                });
            }
        };
        fetchData();
    }, []);

    return (
        <StoreContext.Provider value={storeData}>
            {children}
        </StoreContext.Provider>
    );
}
