"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearPreferenciaFunction = void 0;
const functions = __importStar(require("firebase-functions"));
const cors_1 = __importDefault(require("cors"));
// Configurar CORS para permitir cualquier origen (puede restringirse después)
const corsHandler = (0, cors_1.default)({ origin: true });
const ACCESS_TOKEN = "Bearer APP_USR-1131067617026500-073100-9ba4ef62b4bd4c7859d42e6fef683d56-241135795";
exports.crearPreferenciaFunction = functions.region("us-central1").https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Método no permitido");
        }
        // 🔥 Firebase no parsea req.body como JSON por defecto, hacemos esto:
        if (req.headers["content-type"]?.includes("application/json") &&
            typeof req.body === "string") {
            try {
                req.body = JSON.parse(req.body);
            }
            catch (e) {
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
            if (!response.ok || !data.init_point) {
                console.error("❌ Error en respuesta de MercadoPago:", data);
                return res.status(400).json({ error: "No se pudo crear la preferencia de pago" });
            }
            const { init_point } = data;
            return res.status(200).json({ init_point });
        }
        catch (err) {
            console.error("🔥 Error inesperado:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    });
});
