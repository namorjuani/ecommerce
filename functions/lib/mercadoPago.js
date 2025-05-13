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
// functions/mercadoPago.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
admin.initializeApp();
exports.crearPreferencia = functions.https.onRequest(async (req, res) => {
    const { productos, tiendaId } = req.body;
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    try {
        const docRef = admin.firestore().doc(`tiendas/${tiendaId}`);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(404).send("Tienda no encontrada");
            return;
        }
        const { mercadoPagoToken } = docSnap.data() || {};
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
                success: "https://tu-dominio.com/compra-realizada",
                failure: "https://tu-dominio.com/error",
                pending: "https://tu-dominio.com/pending",
            },
            auto_return: "approved",
        }, {
            headers: {
                Authorization: `Bearer ${mercadoPagoToken}`,
            },
        });
        res.status(200).json({ preferenceId: response.data.id });
    }
    catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).send("Error al crear preferencia");
    }
});
