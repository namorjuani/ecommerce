import { useState } from 'react';
import { db } from '../firebase';
import './css/Gracias.css';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Gracias = () => {
  const [correo, setCorreo] = useState('');
  const [tienda, setTienda] = useState('');
  const [creando, setCreando] = useState(false);
  const [creada, setCreada] = useState(false);
  const navigate = useNavigate();

  const handleCrearTienda = async () => {
    if (!correo || !tienda) {
      alert('Completá todos los campos');
      return;
    }

    setCreando(true);

    try {
      const docRef = doc(db, 'tiendas', tienda);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        alert('Ese nombre de tienda ya está en uso. Probá con otro.');
        setCreando(false);
        return;
      }

      // 1. Crear documento principal de la tienda
      await setDoc(docRef, {
        adminEmail: correo,
        estado: 'activa',
        creada: new Date(),
        vence: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días desde hoy
      });

      // 2. Crear configuración visual por defecto
      const visualRef = doc(db, 'tiendas', tienda, 'configuracion', 'visual');
      await setDoc(visualRef, {
        nombre: "",
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

      // 3. Guardar datos localmente para el admin
      localStorage.setItem('userId', tienda);
      localStorage.setItem('correoAdmin', correo);

      setCreada(true);

      // ✅ Redirigir al panel de administración de la tienda
      setTimeout(() => navigate(`/admin/${tienda}`), 2000);

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
            onChange={(e) => setTienda(e.target.value.toLowerCase())}
          />
          <button onClick={handleCrearTienda} disabled={creando}>
            {creando ? 'Creando...' : 'Activar tienda'}
          </button>
        </>
      ) : (
        <>
          <p>✅ ¡Tu tienda <strong>{tienda}</strong> fue activada!</p>
          <p>Redirigiendo al panel de administración...</p>
        </>
      )}
    </div>
  );
};

export default Gracias;
