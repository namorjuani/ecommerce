// ✅ src/scripts/enviarRecordatorios.ts (manejo el recordatorio de vencimiento 1 dia antes)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { sendReminderEmail } from "../services/emailService";
import { isOneDayBeforeTrialEnd } from "../utils/trialUtils";

// 🔐 Tu config de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpOBiQvaAdKv3xay93o_BOAPJqwvfz0Ms",
  authDomain: "applavaderoartesanal.firebaseapp.com",
  projectId: "applavaderoartesanal",
  storageBucket: "applavaderoartesanal.appspot.com",
  messagingSenderId: "805649099589",
  appId: "1:805649099589:web:40c7c7d89eb6cf96ba6c2c",
  measurementId: "G-YCJ3M38TVH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const enviarRecordatorios = async () => {
    const tiendasSnap = await getDocs(collection(db, "tiendas"));

    for (const docSnap of tiendasSnap.docs) {
        const data = docSnap.data();
        const nombreTienda = docSnap.id;

        const email = data.adminEmail;
        const creada = data.creada;
        const estado = data.estado || "activa";

        if (!email || !creada || estado !== "activa") continue;

        const diasDePrueba = 1; // ⬅️ solo para test, ponelo en 15 o 30 más adelante

        if (isOneDayBeforeTrialEnd(creada, diasDePrueba)) {
            console.log(`📧 Enviando recordatorio a ${email} (${nombreTienda})`);
            await sendReminderEmail(nombreTienda, email, 1);
        }
    }

    console.log("✅ Proceso de recordatorios terminado.");
};

enviarRecordatorios();
