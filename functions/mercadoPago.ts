import cors from "cors";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHandler = cors({ origin: true });

export const crearPreferenciaFunction = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).send("");
      return;
    }

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

      const items = productos.map((prod: any) => ({
        title: prod.nombre,
        unit_price: prod.precio,
        quantity: prod.cantidad || 1,
        currency_id: "ARS",
      }));

      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        {
          items,
          back_urls: {
            success: "https://applavaderoartesanal.web.app/compra-realizada",
            failure: "https://applavaderoartesanal.web.app/error",
            pending: "https://applavaderoartesanal.web.app/pending",
          },
          auto_return: "approved",
        },
        {
          headers: {
            Authorization: `Bearer ${mercadoPagoToken}`,
          },
        }
      );

      res.set("Access-Control-Allow-Origin", "*");
      res.json({
        preferenceId: response.data.id,
        init_point: response.data.init_point,
      });
    } catch (error: any) {
      console.error("❌ Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.message });
    }
  });
});
