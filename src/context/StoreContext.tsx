// src/context/StoreContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// ✅ Interfaz que define los datos básicos de la tienda que vamos a manejar
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

// ✅ Creamos el contexto con valor inicial nulo
const StoreContext = createContext<StoreData | null>(null);

// ✅ Hook para consumir el contexto de la tienda
export const useStore = () => useContext(StoreContext);

// ✅ Proveedor del contexto: envuelve el árbol de la app y expone los datos de la tienda
export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [storeData, setStoreData] = useState<StoreData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Obtenemos el ID de la tienda desde localStorage (o un valor por defecto si no existe)
            const tiendaId = localStorage.getItem("userId") || "d5gnEacrofgn8NxTOdRgwzZRow73";

            // Referencia al documento de la tienda en Firestore
            const ref = doc(db, "tiendas", tiendaId);
            const snap = await getDoc(ref);

            // Si el documento existe, cargamos los datos y los seteamos en el estado
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

        // Llamamos la función al montar el componente
        fetchData();
    }, []); // Solo se ejecuta al inicio

    return (
        <StoreContext.Provider value={storeData}>
            {children}
        </StoreContext.Provider>
    );
}
