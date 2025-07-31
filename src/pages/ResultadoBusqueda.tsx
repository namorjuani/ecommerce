import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock?: number;
  categoria?: string;
  tipo: "producto" | "servicio";
  precioReserva?: number;
  precioTotal?: number;
  envioGratis?: boolean;
  codigoBarras?: string;
}

export default function ResultadoBusqueda() {
  const { termino, slug } = useParams<{ termino: string; slug: string }>();
  const [items, setItems] = useState<Producto[]>([]);

  useEffect(() => {
    const fetchProductosYServicios = async () => {
      const tiendaId = slug || localStorage.getItem("userId") || "default";

      const [productosSnap, serviciosSnap] = await Promise.all([
        getDocs(collection(db, "tiendas", tiendaId, "productos")),
        getDocs(collection(db, "tiendas", tiendaId, "servicios")),
      ]);

      const productos: Producto[] = productosSnap.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
        tipo: "producto",
      }));

      const servicios: Producto[] = serviciosSnap.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
        tipo: "servicio",
      }));

      setItems([...productos, ...servicios]);
    };

    fetchProductosYServicios();
  }, [slug]);

  const resultados = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(termino?.toLowerCase() || "") ||
      item.codigoBarras?.includes(termino || "")
  );

  return (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>Resultados para "{termino}"</h2>

      {resultados.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {resultados.map((item) => (
            <Link
              to={`/tienda/${slug}/producto/${item.id}`}
              key={item.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                width: "200px",
                textDecoration: "none",
                color: "inherit",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={item.imagen || "/imagen-default.jpg"}
                alt={item.nombre}
                onError={(e) => (e.currentTarget.src = "/imagen-default.jpg")}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  marginBottom: "0.5rem",
                }}
              />
              <h3 style={{ fontSize: "1rem", margin: "0.3rem 0" }}>{item.nombre}</h3>

              {item.tipo === "producto" ? (
                <p style={{ fontWeight: "bold" }}>${item.precio}</p>
              ) : (
                <div style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                  {item.precioReserva !== undefined && (
                    <p style={{ margin: 0 }}>
                      Reserva: <strong>${item.precioReserva}</strong>
                    </p>
                  )}
                  {item.precioTotal !== undefined && (
                    <p style={{ margin: 0 }}>
                      Total: <strong>${item.precioTotal}</strong>
                    </p>
                  )}
                </div>
              )}

              {item.envioGratis && (
                <p style={{ color: "green", fontSize: "0.85rem" }}>Envío gratis</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>No se encontraron resultados.</p>
      )}
    </div>
  </div>
);

}
