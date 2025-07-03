import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

interface CategoriaDestacada {
    id: string;
    nombre: string;
    imagen: string;
}

export default function CategoriasDestacadas() {
    const [categorias, setCategorias] = useState<CategoriaDestacada[]>([]);
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    useEffect(() => {
        const cargarCategorias = async () => {
            if (!slug) return;
            const ref = collection(db, "tiendas", slug, "categorias");
            const snapshot = await getDocs(ref);
            const lista: CategoriaDestacada[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    nombre: data.nombre,
                    imagen: data.imagen,
                };
            });
            setCategorias(lista);
        };
        cargarCategorias();
    }, [slug]);

    if (!categorias.length) return null;

    return (
        <div style={{ margin: "2rem 0" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                ¡Conocé nuestras categorías!
            </h2>
            <p style={{ textAlign: "center", marginBottom: "2rem", color: "#666" }}>
                Descubrí todos los productos que tenemos para vos.
            </p>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    justifyContent: "center",
                }}
            >
                {categorias.map((cat) => (
                    <div
                        key={cat.id}
                        style={{
                            width: "200px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "1rem",
                            backgroundColor: "#fff",
                            textAlign: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        <img
                            src={cat.imagen || "/imagen-default.jpg"}
                            alt={cat.nombre}
                            style={{
                                width: "100%",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "6px",
                            }}
                            onError={(e) =>
                                (e.currentTarget.src = "/imagen-default.jpg")
                            }
                        />
                        <p style={{ marginTop: "0.8rem", fontWeight: "bold" }}>{cat.nombre}</p>
                        <button
                            onClick={() => navigate(`/tienda/${slug}/buscar/${encodeURIComponent(cat.nombre)}`)}
                            style={{
                                marginTop: "0.5rem",
                                padding: "0.4rem 0.8rem",
                                backgroundColor: "#3483fa",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Ver categoría
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
