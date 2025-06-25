import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Tienda = () => {
    const { slug } = useParams<{ slug: string }>();
    const [estado, setEstado] = useState<'cargando' | 'inactiva' | 'noexiste' | 'activa'>('cargando');
    const [emailAdmin, setEmailAdmin] = useState('');

    useEffect(() => {
        const obtenerTienda = async () => {
            if (!slug) return;

            const docRef = doc(db, 'tiendas', slug);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setEstado('noexiste');
                return;
            }

            const data = docSnap.data();
            if (data.estado !== 'activa') {
                setEstado('inactiva');
                return;
            }

            setEmailAdmin(data.adminEmail);
            setEstado('activa');
        };

        obtenerTienda();
    }, [slug]);

    if (estado === 'cargando') return <p>Cargando tienda...</p>;
    if (estado === 'noexiste') return <p>❌ Esta tienda no existe.</p>;
    if (estado === 'inactiva') return <p>⛔ Esta tienda está inactiva o vencida.</p>;

    return (
        <div>
            <h2>🛍️ Bienvenido a la tienda: {slug}</h2>
            <p>📧 Administrador: {emailAdmin}</p>

            {/* Aquí va tu catálogo de productos, servicios, etc */}
            <p>Aquí se mostrarán los productos de esta tienda.</p>
        </div>
    );
};

export default Tienda;
