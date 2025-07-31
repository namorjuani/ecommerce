// src/scripts/suspenderTiendasVencidas.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { isTrialExpired } from "../utils/trialUtils";

// 🔐 Config de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpOBiQvaAdKv3xay93o_BOAPJqwvfz0Ms",
    authDomain: "applavaderoartesanal.firebaseapp.com",
    projectId: "applavaderoartesanal",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const suspenderTiendas = async () => {
    const tiendasSnap = await getDocs(collection(db, "tiendas"));

    for (const tiendaDoc of tiendasSnap.docs) {
        const data = tiendaDoc.data();
        const nombreTienda = tiendaDoc.id;

        if (!data.creada || data.estado !== "activa") continue;

        const diasDePrueba = 1; // para test, después poné 15 o 30

        if (isTrialExpired(data.creada, diasDePrueba)) {
            console.log(`🚫 Suspendiendo tienda: ${nombreTienda}`);
            await updateDoc(doc(db, "tiendas", nombreTienda), {
                estado: "suspendida",
                motivoSuspension: "Prueba gratuita vencida",
            });
        }
    }

    console.log("✅ Proceso de suspensión terminado.");
};

suspenderTiendas();
