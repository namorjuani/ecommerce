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
exports.crearPreferencia = void 0;
const cors_1 = __importDefault(require("cors"));
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const corsHandler = (0, cors_1.default)({ origin: true });
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.crearPreferencia = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const { productos, tiendaId } = req.body;
        if (!productos || !tiendaId) {
            res.status(400).json({ error: "Faltan datos requeridos." });
            return;
        }
        try {
            const docRef = admin.firestore().doc(`tiendas/${tiendaId}`);
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                res.status(404).send("Tienda no encontrada");
                return;
            }
            const data = docSnap.data();
            const mercadoPagoToken = data?.mercadoPagoToken;
            if (!mercadoPagoToken) {
                res.status(400).send("La tienda no tiene cargado su token de Mercado Pago");
                return;
            }
            const items = productos.map((prod) => ({
                title: prod.nombre,
                unit_price: prod.precio,
                quantity: prod.cantidad || 1,
                currency_id: "ARS",
            }));
            const response = await axios_1.default.post("https://api.mercadopago.com/checkout/preferences", {
                items,
                back_urls: {
                    success: "https://applavaderoartesanal.web.app/compra-realizada",
                    failure: "https://applavaderoartesanal.web.app/error",
                    pending: "https://applavaderoartesanal.web.app/pending",
                },
                auto_return: "approved",
            }, {
                headers: {
                    Authorization: `Bearer ${mercadoPagoToken}`,
                },
            });
            res.json({ preferenceId: response.data.id });
        }
        catch (error) {
            console.error("Error al crear preferencia:", error);
            res.status(500).send("Error al crear preferencia");
        }
    });
});
