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
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const fetchProductos = async () => {
      const tiendaId = slug || localStorage.getItem("userId") || "default";
      const snapshot = await getDocs(
        collection(db, "tiendas", tiendaId, "productos")
      );
      const data: Producto[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
      }));
      setProductos(data);
    };

    fetchProductos();
  }, [slug]);

  const resultados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(termino?.toLowerCase() || "") ||
      producto.codigoBarras?.includes(termino || "")
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Resultados para "{termino}"</h2>
      {resultados.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {resultados.map((producto) => (
            <Link
              to={`/tienda/${slug}/producto/${producto.id}`}
              key={producto.id}
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
                src={producto.imagen || "/imagen-default.jpg"}
                alt={producto.nombre}
                onError={(e) => (e.currentTarget.src = "/imagen-default.jpg")}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  marginBottom: "0.5rem",
                }}
              />
              <h3 style={{ fontSize: "1rem", margin: "0.3rem 0" }}>
                {producto.nombre}
              </h3>
              <p style={{ fontWeight: "bold" }}>${producto.precio}</p>
              {producto.envioGratis && (
                <p style={{ color: "green", fontSize: "0.85rem" }}>
                  Envío gratis
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p>No se encontraron productos.</p>
      )}
    </div>
  );
}
