// src/context/TiendaContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

// ✅ Interfaz que define el shape (estructura) de los datos de configuración visual de la tienda
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

// ✅ Creamos el contexto inicial, que arranca en null
const TiendaContext = createContext<TiendaData | null>(null);

// ✅ Hook personalizado para consumir el contexto
export const useTienda = () => useContext(TiendaContext);

// ✅ Provider que obtiene y expone los datos de la tienda
export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const [tienda, setTienda] = useState<TiendaData | null>(null);
  const { slug } = useParams();  // Obtenemos el slug dinámico de la URL (ej: /tienda/:slug)

  useEffect(() => {
    if (!slug) return; // Si no hay slug, no hacemos nada

    // Referencia al documento de configuración visual de la tienda en Firestore
    const ref = doc(db, "tiendas", slug, "configuracion", "visual");

    // Escuchamos cambios en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as TiendaData;

        // Guardamos los datos en el estado
        setTienda(data);

        // Si hay un color de fondo, lo aplicamos como variable CSS global
        if (data.colorFondo) {
          document.documentElement.style.setProperty("--color-fondo", data.colorFondo);
        }
      }
    });

    // Limpiamos el listener al desmontar o cambiar de tienda
    return () => unsubscribe();
  }, [slug]); // Se dispara si cambia el slug

  // Exponemos el valor de tienda a través del contexto
  return (
    <TiendaContext.Provider value={tienda}>
      {children}
    </TiendaContext.Provider>
  );
}
