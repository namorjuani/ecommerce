import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

if (!admin.apps.length) admin.initializeApp();

export const webhookPagoLanding = functions.https.onRequest(async (req, res) => {
    try {
        const topic = req.query.topic || req.query.type;
        const id = req.query["data.id"];

        if (!topic || !id) {
            res.status(400).send("Faltan parámetros");
            return;
        }

        if (topic !== "payment") {
            res.status(200).send("No es un pago, se ignora.");
            return;
        }

        const MP_ACCESS_TOKEN = "Bearer 881acf130c1c481bbb8f51391f46be7680e0352818de190db7919f48f9abeb3a";

        const pagoResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
                Authorization: MP_ACCESS_TOKEN,
            },
        });

        const pago = (await pagoResponse.json()) as {
            status?: string;
            metadata?: { email?: string; nombreTienda?: string };
        };

        if (pago.status === "approved") {
            const { email, nombreTienda } = pago.metadata || {};

            if (!email || !nombreTienda) {
                res.status(400).send("Faltan datos en metadata");
                return;
            }

            await admin.firestore().collection("activacionesLanding").add({
                email,
                nombreTienda,
                fecha: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log("✅ Activación registrada:", { email, nombreTienda });
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("❌ Error en webhook:", error);
        res.status(500).send("Error interno del servidor");
    }
});
