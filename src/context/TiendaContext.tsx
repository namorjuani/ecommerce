// ✅ TiendaContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

export interface TiendaData {
  nombre?: string;
  descripcion: string;
  imagen?: string;
  logo?: string;
  whatsapp: string;
  textoHero: string;
  colorFondo: string;
  colorBoton: string;
  linkInstagram?: string;
  linkFacebook?: string;
  googleMaps: string;
  textoUbicacion: string;
  categoriaDestacada1?: string;
  categoriaDestacada2?: string;
  alturaBanner?: string;
  posicionBanner?: string;
  tamañoBanner?: string;
  
}

interface TiendaContextType {
  tienda: TiendaData | null;
  setTiendaActual: (tienda: TiendaData) => void;
}

const TiendaContext = createContext<TiendaContextType>({
  tienda: null,
  setTiendaActual: () => {},
});

export const useTienda = () => useContext(TiendaContext);

export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const [tienda, setTienda] = useState<TiendaData | null>(null);
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;
    const ref = doc(db, "tiendas", slug, "configuracion", "visual");
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as TiendaData;
        setTienda(data);
        if (data.colorFondo) {
          document.documentElement.style.setProperty("--color-fondo", data.colorFondo);
        }
      }
    });
    return () => unsubscribe();
  }, [slug]);

  return (
    <TiendaContext.Provider value={{ tienda, setTiendaActual: setTienda }}>
      {children}
    </TiendaContext.Provider>
  );
}
