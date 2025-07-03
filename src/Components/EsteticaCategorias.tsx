import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function EsteticaCategorias() {
    const { slug } = useParams<{ slug: string }>();
    const [categorias, setCategorias] = useState<string[]>([]);
    const [cat1, setCat1] = useState("");
    const [cat2, setCat2] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;

            // Traer productos para obtener categorías únicas
            const catSnap = await getDocs(collection(db, "tiendas", slug, "productos"));
            const catSet = new Set<string>();
            catSnap.forEach((doc) => {
                const data = doc.data();
                if (data.categoria) catSet.add(data.categoria);
            });
            const lista = Array.from(catSet);
            setCategorias(lista);

            // Traer config actual de categorías destacadas
            const ref = doc(db, "tiendas", slug);
            const tiendaSnap = await getDoc(ref);
            if (tiendaSnap.exists()) {
                const data = tiendaSnap.data();
                setCat1(data.categoriaDestacada1 || "");
                setCat2(data.categoriaDestacada2 || "");
            }
        };
        fetchData();
    }, [slug]);

    const guardar = async () => {
        if (!slug) return;
        const ref = doc(db, "tiendas", slug);
        await setDoc(ref, {
            categoriaDestacada1: cat1,
            categoriaDestacada2: cat2,
        }, { merge: true });
        alert("Categorías guardadas ✅");
    };

    return (
        <div>
            <h3>Categorías del menú</h3>

            <label>📌 Categoría 1:</label>
            <select value={cat1} onChange={(e) => setCat1(e.target.value)}>
                <option value="">-- Seleccionar --</option>
                {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <br />

            <label>📌 Categoría 2:</label>
            <select value={cat2} onChange={(e) => setCat2(e.target.value)}>
                <option value="">-- Seleccionar --</option>
                {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <br />
            <button onClick={guardar} style={{ marginTop: "1rem" }}>💾 Guardar categorías</button>
        </div>
    );
}
