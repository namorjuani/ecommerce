import { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface ProductoCSV {
    nombre: string;
    precio: number;
    stock: number;
    imagen?: string;
    categoria?: string;
}

interface Props {
    limite: number; // límite de productos según el plan
}

export default function ImportadorCSV({ limite }: Props) {
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

                // Obtener productos actuales
                const productosRef = collection(db, "tiendas", usuario.uid, "productos");
                const snapshot = await getDocs(productosRef);
                const cantidadActual = snapshot.size;

                if (cantidadActual + data.length > limite) {
                    setCsvInfo(`⛔ Límite excedido. Ya tenés ${cantidadActual} productos y estás intentando cargar ${data.length}. Máximo: ${limite}`);
                    return;
                }

                // Cargar productos a Firebase
                let cargados = 0;
                for (const producto of data) {
                    if (producto.nombre && producto.precio) {
                        await addDoc(productosRef, {
                            nombre: producto.nombre,
                            precio: Number(producto.precio),
                            stock: Number(producto.stock || 0),
                            imagen: producto.imagen || "",
                            categoria: producto.categoria || "",
                            tipo: "producto"
                        });
                        cargados++;
                    }
                }

                setCsvInfo(`✅ ${cargados} productos cargados con éxito.`);
            },
            error: () => {
                setCsvInfo("⛔ Error al procesar el archivo. Asegurate que sea un .csv válido.");
            },
        });
    };

    // Descargar plantilla
    const descargarPlantilla = () => {
        const contenido = "nombre,precio,stock,imagen,categoria\nRemera Blanca,4999,10,https://ejemplo.com/remera.jpg,Ropa\nJean Azul,9999,5,https://ejemplo.com/jean.jpg,Ropa";
        const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "plantilla_productos.csv";
        link.click();
    };

    return (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h4>📥 Importar productos desde archivo CSV</h4>
            <p>
                Subí un archivo <strong>.csv</strong> con columnas: <br />
                <code>nombre, precio, stock, imagen, categoria</code>
            </p>
            <p style={{ fontSize: "0.9rem", color: "#444" }}>
                ⚠️ Si ya tenés un archivo de Excel, guardalo como: <br />
                <strong>Archivo → Guardar como → CSV (delimitado por comas)</strong>
            </p>

            <button onClick={descargarPlantilla} style={{ marginBottom: "1rem", background: "#4CAF50", color: "white", padding: "0.4rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                📄 Descargar plantilla CSV
            </button>

            <input type="file" accept=".csv" onChange={handleArchivo} />
            {csvInfo && <p style={{ marginTop: "1rem", color: csvInfo.startsWith("✅") ? "green" : "red" }}>{csvInfo}</p>}
        </div>
    );
}
