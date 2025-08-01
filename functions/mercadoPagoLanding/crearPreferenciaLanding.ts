import { Request, Response } from "express";
import * as functions from "firebase-functions";
import cors from "cors";

// Configurar CORS para permitir cualquier origen (puede restringirse después)
const corsHandler = cors({ origin: true });

const ACCESS_TOKEN = "Bearer APP_USR-1131067617026500-073100-9ba4ef62b4bd4c7859d42e6fef683d56-241135795";

interface MercadoPagoResponse {
    init_point: string;
}

export const crearPreferenciaFunction = functions.region("us-central1").https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Método no permitido");
        }

        // 🔥 Firebase no parsea req.body como JSON por defecto, hacemos esto:
        if (
            req.headers["content-type"]?.includes("application/json") &&
            typeof req.body === "string"
        ) {
            try {
                req.body = JSON.parse(req.body);
            } catch (e) {
                console.error("❌ Error al parsear req.body:", req.body);
                return res.status(400).json({ error: "Formato de JSON inválido" });
            }
        }

        try {
            const { email, nombreTienda } = req.body;
            console.log("📥 Datos recibidos:", req.body);

            if (!email || !nombreTienda) {
                console.error("⚠️ Datos faltantes:", { email, nombreTienda });
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            const preference = {
                payer: {
                    email,
                },
                items: [
                    {
                        title: `Suscripción mensual - ${nombreTienda}`,
                        quantity: 1,
                        currency_id: "ARS",
                        unit_price: 2000,
                    },
                ],
                back_urls: {
                    success: "https://tu-app.com/success",
                    failure: "https://tu-app.com/failure",
                    pending: "https://tu-app.com/pending",
                },
                auto_return: "approved",
            };

            console.log("📦 Preference a enviar:", JSON.stringify(preference, null, 2));

            const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: ACCESS_TOKEN,
                },
                body: JSON.stringify(preference),
            });

            const data = await response.json();

            if (!response.ok || !(data as any).init_point) {
                console.error("❌ Error en respuesta de MercadoPago:", data);
                return res.status(400).json({ error: "No se pudo crear la preferencia de pago" });
            }

            const { init_point } = data as MercadoPagoResponse;
            return res.status(200).json({ init_point });

        } catch (err) {
            console.error("🔥 Error inesperado:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    });
});
