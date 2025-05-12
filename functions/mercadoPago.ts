import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

export const crearPreferencia = functions.https.onRequest(async (req, res) => {
  const { productos, tiendaId } = req.body;

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
          success: "https://tu-dominio.com/compra-realizada",
          failure: "https://tu-dominio.com/error",
          pending: "https://tu-dominio.com/pending",
        },
        auto_return: "approved",
      },
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoToken}`,
        },
      }
    );

    res.status(200).json({ preferenceId: response.data.id });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).send("Error al crear preferencia");
  }
});
