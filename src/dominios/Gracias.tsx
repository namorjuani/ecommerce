// ✅ src/pages/Gracias.tsx
import { useState } from 'react';
import { db } from '../firebase';
import '../pages/css/Gracias.css';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { crearTiendaConEmail } from '../services/crearTiendaConEmail';
import { sendWelcomeEmail } from '../services/emailService';

const Gracias = () => {
  const [correo, setCorreo] = useState('');
  const [tienda, setTienda] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planParam = searchParams.get("plan");
  const planValido = planParam === "estandar" || planParam === "premium" ? planParam : "basico";
  const [plan, setPlan] = useState<'basico' | 'estandar' | 'premium'>(planValido);
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

      const diasDePrueba = 1; // ⬆️ para probar el recordatorio, se puede cambiar luego a 15 o 30

      await setDoc(docRef, {
        adminEmail: correo,
        estado: 'activa',
        creada: new Date().toISOString(),
        vence: Date.now() + diasDePrueba * 24 * 60 * 60 * 1000,
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
        creado: new Date().toISOString(),
      });

      await setDoc(doc(db, "usuarios", correo), {
        tiendas: arrayUnion(nombreLimpio),
        rol: "admin"
      }, { merge: true });

      await crearTiendaConEmail(nombreLimpio, tienda, tienda, correo, plan);
      await sendWelcomeEmail(tienda, correo, diasDePrueba); // ✉️ envío de bienvenida

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
