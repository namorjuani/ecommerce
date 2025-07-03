// src/dominios/Gracias.tsx
import { useState } from 'react';
import { db } from '../firebase';
import '../pages/css/Gracias.css';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Gracias = () => {
  const [correo, setCorreo] = useState('');         // Correo del admin que crea la tienda
  const [tienda, setTienda] = useState('');         // Nombre elegido para la tienda
  const [creando, setCreando] = useState(false);    // Estado para mostrar loader al crear
  const [creada, setCreada] = useState(false);      // Estado para mostrar confirmación
  const navigate = useNavigate();

  /**
   * Valida campos y crea la tienda en Firestore con toda la estructura inicial
   */
  const handleCrearTienda = async () => {
    if (!correo || !tienda) {
      alert('Completá todos los campos');
      return;
    }

    // Convierte el nombre de la tienda en un slug limpio (sin espacios)
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

      // Paso 1: Crear documento principal de la tienda
      await setDoc(docRef, {
        adminEmail: correo,
        estado: 'activa',
        creada: new Date(),
        vence: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días de prueba
      });

      // Paso 2: Crear configuración visual inicial
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

      // Paso 3: Registrar usuario como admin en la tienda
      await setDoc(doc(db, 'tiendas', nombreLimpio, 'usuarios', correo), {
        rol: "admin",
        creado: new Date(),
      });

      // Paso 4: Asociar la tienda al documento del usuario (usuarios global)
      await setDoc(doc(db, "usuarios", correo), {
        tiendas: arrayUnion(nombreLimpio),
        rol: "admin"
      }, { merge: true });

      // Paso 5: Guardar en localStorage y redirigir
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
