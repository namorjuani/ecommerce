import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface VarianteCSV {
    nombre: string;
    stock: number;
}

interface ProductoCSV {
    codigoBarras?: string;
    nombre: string;
    precio: number;
    imagen?: string;
    otrasImagenes?: string; // Coma separadas
    descripcionCorta?: string;
    descripcionLarga?: string;
    cuotas?: string;
    envioGratis?: string; // "si" | "no"
    color?: string;
    stock: number;
    categoria?: string;
    tipo?: "producto" | "servicio";
    variantes?: string; // JSON string: [{"nombre":"Talle S", "stock":10}]
}

interface Props {
    limite: number;
    slug: string;
}

export default function ImportadorCSV({ limite, slug }: Props) {
    const { usuario } = useAuth();
    const [csvInfo, setCsvInfo] = useState<string>("");

    const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo || !usuario) return;

        const texto = await archivo.text();
        Papa.parse(texto, {
            header: true,
            skipEmptyLines: true,
            complete: async (resultado: Papa.ParseResult<ProductoCSV>) => {
                const data = resultado.data;

                const productosRef = collection(db, "tiendas", slug, "productos");
                const snapshot = await getDocs(productosRef);
                const cantidadActual = snapshot.size;

                if (cantidadActual + data.length > limite) {
                    setCsvInfo(`⛔ Límite excedido. Tenés ${cantidadActual} y estás intentando agregar ${data.length}. Máx: ${limite}`);
                    return;
                }

                let cargados = 0;
                for (const producto of data) {
                    if (producto.nombre && producto.precio) {
                        await addDoc(productosRef, {
                            codigoBarras: producto.codigoBarras || "",
                            nombre: producto.nombre,
                            precio: Number(producto.precio),
                            imagen: producto.imagen || "",
                            otrasImagenes: producto.otrasImagenes ? producto.otrasImagenes.split(",").map(i => i.trim()) : [],
                            descripcionCorta: producto.descripcionCorta || "",
                            descripcionLarga: producto.descripcionLarga || "",
                            cuotas: producto.cuotas || "",
                            envioGratis: producto.envioGratis?.toLowerCase() === "si",
                            color: producto.color || "",
                            stock: Number(producto.stock || 0),
                            categoria: producto.categoria || "",
                            tipo: producto.tipo || "producto",
                            variantes: producto.variantes ? JSON.parse(producto.variantes) : []
                        });
                        cargados++;
                    }
                }

                setCsvInfo(`✅ ${cargados} productos cargados correctamente.`);
            },
            error: () => {
                setCsvInfo("⛔ Error al procesar el archivo. Verificá el formato del CSV.");
            },
        });
    };

    const descargarPlantilla = () => {
        const contenido =
            `codigoBarras,nombre,precio,imagen,otrasImagenes,descripcionCorta,descripcionLarga,cuotas,envioGratis,color,stock,categoria,tipo,variantes
1234567890123,Remera Blanca,4999,https://ejemplo.com/remera.jpg,https://ejemplo.com/remera2.jpg|https://ejemplo.com/remera3.jpg,Remera básica,Remera blanca de algodón,3 cuotas,si,Blanco,10,Ropa,producto,"[{""nombre"":""S"",""stock"":5},{""nombre"":""M"",""stock"":5}]"
9876543210987,Servicio de limpieza,15000,,,,Servicio básico,Servicio de limpieza profunda,,,0,Servicios,servicio,"[]"`;

        const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "plantilla_productos_completa.csv";
        link.click();
    };

    return (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h4>📥 Importar productos avanzados desde CSV</h4>
            <p>
                Subí un archivo <strong>.csv</strong> con columnas:<br />
                <code>codigoBarras, nombre, precio, imagen, otrasImagenes, descripcionCorta, descripcionLarga, cuotas, envioGratis, color, stock, categoria, tipo, variantes</code>
            </p>
            <p style={{ fontSize: "0.9rem", color: "#444" }}>
                ⚠️ Recordá que los links de imágenes deben ser públicos (por ejemplo, subidas a un hosting o plataforma y copiar dirección de imagen).
            </p>

            <button onClick={descargarPlantilla}
                style={{ marginBottom: "1rem", background: "#4CAF50", color: "white", padding: "0.4rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                📄 Descargar plantilla completa CSV
            </button>

            <input type="file" accept=".csv" onChange={handleArchivo} />
            {csvInfo && (
                <p style={{ marginTop: "1rem", color: csvInfo.startsWith("✅") ? "green" : "red" }}>
                    {csvInfo}
                </p>
            )}
        </div>
    );
}
