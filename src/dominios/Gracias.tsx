// src/dominios/Gracias.tsx
import { useState } from 'react';
import { db } from '../firebase';
import '../pages/css/Gracias.css';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Gracias = () => {
  const [correo, setCorreo] = useState('');
  const [tienda, setTienda] = useState('');
  const [plan, setPlan] = useState<'basico' | 'estandar' | 'premium'>('basico');
  const [creando, setCreando] = useState(false);
  const [creada, setCreada] = useState(false);
  const navigate = useNavigate();

  const handleCrearTienda = async () => {
    if (!correo || !tienda) {
      alert('Completá todos los campos');
      return;
    }

    const nombreLimpio = tienda.toLowerCase().replace(/\s+/g, '');

    setCreando(true);

    try {
      const docRef = doc(db, 'tiendas', nombreLimpio);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        alert('Ese nombre de tienda ya está en uso. Probá con otro.');
        setCreando(false);
        return;
      }

      await setDoc(docRef, {
        adminEmail: correo,
        estado: 'activa',
        creada: new Date(),
        vence: Date.now() + 30 * 24 * 60 * 60 * 1000,
        plan: plan,
        limiteProductos: plan === 'basico' ? 50 : plan === 'estandar' ? 300 : null,
        limiteServicios: plan === 'basico' ? 0 : plan === 'estandar' ? 100 : null,
        limiteTotal: plan === 'basico' ? 50 : plan === 'estandar' ? 400 : null,
      });

      await setDoc(doc(db, 'tiendas', nombreLimpio, 'configuracion', 'visual'), {
        nombre: nombreLimpio,
        descripcion: "",
        imagen: "",
        logo: "",
        whatsapp: "",
        textoHero: "",
        colorFondo: "#ffffff",
        colorBoton: "#3483fa",
        linkInstagram: "",
        linkFacebook: "",
        googleMaps: "",
        textoUbicacion: "",
        categoriaDestacada1: "",
        categoriaDestacada2: "",
        alturaBanner: "",
        posicionBanner: "center",
        tamañoBanner: "cover",
      });

      await setDoc(doc(db, 'tiendas', nombreLimpio, 'usuarios', correo), {
        rol: "admin",
        creado: new Date(),
      });

      await setDoc(doc(db, "usuarios", correo), {
        tiendas: arrayUnion(nombreLimpio),
        rol: "admin"
      }, { merge: true });

      localStorage.setItem('userId', nombreLimpio);
      localStorage.setItem('correoAdmin', correo);
      setCreada(true);

      setTimeout(() => navigate(`/tienda/${nombreLimpio}`), 2500);

    } catch (err) {
      console.error('Error al crear tienda:', err);
      alert('Hubo un error al activar tu tienda');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="gracias-container">
      <h2>🎉 ¡Gracias por tu pago!</h2>

      {!creada ? (
        <>
          <p>Completá estos datos para activar tu tienda:</p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => setPlan('basico')}>Plan Básico</button>
            <button onClick={() => setPlan('estandar')}>Plan Estándar</button>
            <button onClick={() => setPlan('premium')}>Plan Premium</button>
          </div>

          <input
            type="email"
            placeholder="Tu correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nombre de tu tienda (sin espacios)"
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
          />
          <button onClick={handleCrearTienda} disabled={creando}>
            {creando ? 'Creando...' : 'Activar tienda'}
          </button>
        </>
      ) : (
        <>
          <p>✅ ¡Tu tienda <strong>{tienda}</strong> fue activada!</p>
          <p>Redirigiendo a tu tienda...</p>
        </>
      )}
    </div>
  );
};

export default Gracias;
