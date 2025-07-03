import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import ImportadorCSV from "../../pages/ImportadorCSV";
import ModificarProductos from "../../pages/ModificarProductos";


interface Producto {
    id?: string;
    nombre: string;
    precio: number;
    imagen: string;
    imagenes?: string[];
    descripcion?: string;
    descripcionCorta?: string;
    cuotas?: string;
    envioGratis?: boolean;
    color?: string;
    stock: number;
    tipo: "producto" | "servicio";
    categoria?: string;
    variantes?: {
        nombre: string;
        stock: number;
    }[];
    precioReserva?: number;
    precioTotal?: number;
    codigoBarras?: string;
}
export default function AdminProductos({ slug }: { slug: string }) {
    const { usuario } = useAuth();
    const [nuevo, setNuevo] = useState<Producto>({
        nombre: "",
        precio: 0,
        imagen: "",
        imagenes: [],
        descripcion: "",
        descripcionCorta: "",
        cuotas: "",
        envioGratis: false,
        color: "",
        stock: 0,
        tipo: "producto",
        categoria: "",
        variantes: [],
        precioReserva: 0,
        precioTotal: 0,
    });

    const guardarProductoNuevo = async () => {
        if (!usuario) return;
        const ref = collection(db, "tiendas", slug, "productos");
        await addDoc(ref, nuevo);
        alert("Producto agregado");
        setNuevo({
            nombre: "",
            precio: 0,
            imagen: "",
            imagenes: [],
            descripcion: "",
            descripcionCorta: "",
            cuotas: "",
            envioGratis: false,
            color: "",
            stock: 0,
            tipo: "producto",
            categoria: "",
            variantes: [],
            precioReserva: 0,
            precioTotal: 0,
        });
    };

    return (
        <>
            <ImportadorCSV limite={50} slug={slug} />
            <h3>Agregar producto nuevo</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                <label>Código de barras (opcional):
                    <input
                        type="text"
                        value={nuevo.codigoBarras || ""}
                        onChange={(e) => setNuevo({ ...nuevo, codigoBarras: e.target.value })}
                    />
                </label>
                <label>Nombre
                    <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
                </label>
                {nuevo.tipo === "producto" && (
                    <label>Precio
                        <input
                            type="number"
                            value={nuevo.precio}
                            onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
                        />
                    </label>
                )}
                {nuevo.tipo === "servicio" && (
                    <>
                        <label>Precio de reserva
                            <input
                                type="number"
                                value={nuevo.precioReserva || 0}
                                onChange={(e) => setNuevo({ ...nuevo, precioReserva: Number(e.target.value) })}
                            />
                        </label>
                        <label>Precio total del servicio
                            <input
                                type="number"
                                value={nuevo.precioTotal || 0}
                                onChange={(e) => setNuevo({ ...nuevo, precioTotal: Number(e.target.value) })}
                            />
                        </label>
                    </>
                )}
                <label>Imagen principal
                    <input value={nuevo.imagen} onChange={(e) => setNuevo({ ...nuevo, imagen: e.target.value })} />
                </label>
                <label>Otras imágenes (separar URLs con coma)
                    <input
                        value={nuevo.imagenes?.join(",") || ""}
                        onChange={(e) => setNuevo({ ...nuevo, imagenes: e.target.value.split(",") })}
                    />
                </label>
                <label>Descripción larga
                    <textarea value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
                </label>
                <label>Descripción corta
                    <input value={nuevo.descripcionCorta} onChange={(e) => setNuevo({ ...nuevo, descripcionCorta: e.target.value })} />
                </label>
                <label>Cuotas
                    <input value={nuevo.cuotas} onChange={(e) => setNuevo({ ...nuevo, cuotas: e.target.value })} />
                </label>
                <label>Envío gratis
                    <input
                        type="checkbox"
                        checked={nuevo.envioGratis}
                        onChange={(e) => setNuevo({ ...nuevo, envioGratis: e.target.checked })}
                    />
                </label>
                <label>Color
                    <input value={nuevo.color} onChange={(e) => setNuevo({ ...nuevo, color: e.target.value })} />
                </label>
                <label>Stock base
                    <input
                        type="number"
                        value={nuevo.stock}
                        onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })}
                    />
                </label>
                <label>Categoría
                    <input value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} />
                </label>
                <label>Tipo
                    <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value as "producto" | "servicio" })}>
                        <option value="producto">Producto</option>
                        <option value="servicio">Servicio</option>
                    </select>
                </label>
            </div>

            <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                <h4>Variantes del producto (opcional)</h4>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <input placeholder="Nombre variante (ej: 1.62cm)" id="variante-nombre" />
                    <input placeholder="Stock" type="number" id="variante-stock" />
                    <button
                        type="button"
                        onClick={() => {
                            const nombre = (document.getElementById("variante-nombre") as HTMLInputElement).value;
                            const stock = parseInt((document.getElementById("variante-stock") as HTMLInputElement).value);
                            if (nombre && !isNaN(stock)) {
                                setNuevo(prev => ({
                                    ...prev,
                                    variantes: [...(prev.variantes || []), { nombre, stock }]
                                }));
                                (document.getElementById("variante-nombre") as HTMLInputElement).value = "";
                                (document.getElementById("variante-stock") as HTMLInputElement).value = "";
                            }
                        }}
                        style={{ backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "5px", cursor: "pointer" }}
                    >
                        ➕ Añadir variante
                    </button>
                </div>

                {(nuevo.variantes && nuevo.variantes.length > 0) ? (
                    <ul>
                        {nuevo.variantes.map((v, i) => (
                            <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span>{v.nombre} → Stock: {v.stock}</span>
                                <button
                                    type="button"
                                    onClick={() => setNuevo(prev => ({
                                        ...prev,
                                        variantes: prev.variantes?.filter((_, idx) => idx !== i) || []
                                    }))}
                                    style={{ backgroundColor: "red", color: "white", border: "none", padding: "0.2rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}
                                >
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>No hay variantes añadidas.</p>
                )}
            </div>

            <button
                onClick={guardarProductoNuevo}
                style={{ marginBottom: "2rem", backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}
            >
                ➕ Agregar producto
            </button>

            <ModificarProductos slug={slug} />
        </>
    );
}
