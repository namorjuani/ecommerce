// ✅ src/services/crearTiendaConEmail.ts
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendWelcomeEmail } from '../services/emailService';

export const crearTiendaConEmail = async (
    userId: string,
    nombreTienda: string,
    nombreUsuario: string,
    correoUsuario: string,
    plan: "basico" | "estandar" | "premium"
) => {
    const fechaHoy = new Date().toISOString();
    const diasDePrueba = 1; // cambiar a 7, 15 o 30 después
    const fechaVencimiento = new Date(Date.now() + diasDePrueba * 24 * 60 * 60 * 1000).toISOString();

    try {
        await setDoc(doc(db, "tiendas", userId), {
            nombre: nombreTienda,
            adminEmail: correoUsuario,
            creadoDesdeLanding: true,
            plan: plan,
            estado: "activa",
            creada: fechaHoy,
            vence: fechaVencimiento,
        });

        await sendWelcomeEmail(nombreUsuario, correoUsuario, diasDePrueba);

        console.log("Tienda creada y correo enviado ✅");
    } catch (error) {
        console.error("Error al crear tienda o enviar email ❌", error);
    }
};
