import cors from "cors";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

export const crearPreferencia = functions.https.onRequest((req, res) => {
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

      res.json({ preferenceId: response.data.id });
    } catch (error) {
      console.error("Error al crear preferencia:", error);
      res.status(500).send("Error al crear preferencia");
    }
  });
});
