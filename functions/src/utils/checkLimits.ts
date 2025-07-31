import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../src/firebase";

export async function checkLimits(slug: string) {
    const tiendaRef = doc(db, `tiendas/${slug}`);
    const tiendaSnap = await getDoc(tiendaRef);

    if (!tiendaSnap.exists()) {
        throw new Error("La tienda no existe.");
    }

    const tiendaData = tiendaSnap.data();
    const plan = (tiendaData.plan || "basico") as "basico" | "estandar" | "premium";

    const planes: Record<"basico" | "estandar" | "premium", { limiteProductos: number | null, limiteServicios: number | null, limiteTotal: number | null }> = {
        basico: {
            limiteProductos: 48,
            limiteServicios: 0,
            limiteTotal: 48,
        },
        estandar: {
            limiteProductos: 5,
            limiteServicios: 5,
            limiteTotal: 10,
        },
        premium: {
            limiteProductos: null,
            limiteServicios: null,
            limiteTotal: null,
        },
    };

    const limites = planes[plan];

    const productosSnap = await getDocs(collection(db, `tiendas/${slug}/productos`));
    const serviciosSnap = await getDocs(collection(db, `tiendas/${slug}/servicios`));

    const cantidadProductos = productosSnap.docs.length;
    const cantidadServicios = serviciosSnap.docs.length;
    const total = cantidadProductos + cantidadServicios;

    if (limites.limiteProductos !== null && cantidadProductos >= limites.limiteProductos) {
        return { allowed: false, reason: "Límite de productos alcanzado, elimina un producto o actualiza a Premium para continuar.", limiteTotal: limites.limiteTotal };
    }

    if (limites.limiteServicios !== null && cantidadServicios >= limites.limiteServicios) {
        return { allowed: false, reason: "Límite de servicios alcanzado, elimina un servicio o actualiza a Premium para continuar.", limiteTotal: limites.limiteTotal };
    }

    if (limites.limiteTotal !== null && total >= limites.limiteTotal) {
        return { allowed: false, reason: "Límite total alcanzado, actualiza a Premium para seguir cargando.", limiteTotal: limites.limiteTotal };
    }

    return {
        allowed: true,
        productos: cantidadProductos,
        servicios: cantidadServicios,
        limiteProductos: limites.limiteProductos,
        limiteServicios: limites.limiteServicios,
        limiteTotal: limites.limiteTotal,
    };
}
