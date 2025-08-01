import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { isTrialExpired } from "../src/utils/trialUtils";

admin.initializeApp();
const db = getFirestore();

export const suspenderPruebas = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("America/Argentina/Buenos_Aires")
    .onRun(async () => {
        const tiendasSnap = await db.collection("tiendas").get();

        for (const tiendaDoc of tiendasSnap.docs) {
            const data = tiendaDoc.data();
            const nombreTienda = tiendaDoc.id;

            if (!data.creada || data.estado !== "activa") continue;

            const diasDePrueba = 1; // cambiar a 15 o 30 más adelante
            if (isTrialExpired(data.creada, diasDePrueba)) {
                console.log(`🚫 Suspendiendo tienda: ${nombreTienda}`);
                await tiendaDoc.ref.update({
                    estado: "suspendida",
                    motivoSuspension: "Prueba gratuita vencida",
                });
            }
        }

        console.log("✅ Proceso de suspensión automática terminado");
    });
