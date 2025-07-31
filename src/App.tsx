
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./Components/admin/Admin";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import PrivateRoute from "./routes/PrivateRoute";
import Checkout from "./pages/Checkout";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./Components/Layout";
import Pedidos from "./pages/Pedidos";
import CompraRealizada from "./pages/CompraRealizada";
import FormaEntrega from "./pages/FormaEntrega";
import FormaDePago from "./pages/FormaDePago";
import { ClienteProvider } from "./context/ClienteContext";
import DatosEnvio from "./pages/DatosEnvio";
import AgendarServicio from "./pages/AgendarServicio";
import CheckoutReserva from "./pages/CheckoutReserva";
import ResultadoBusqueda from "./pages/ResultadoBusqueda";
import { TiendaProvider } from "./context/TiendaContext";
import FormaDePagoEmpleado from "./Components/empleados/FormaDePagoEmpleado";
import Gracias from "./dominios/Gracias";
import Tienda from "./pages/Tienda";
import Landing from "./dominios/Landing";
import Planes from "./dominios/Planes";
import SeleccionarTienda from "./dominios/SeleccionarTienda";
import Historial from "./pages/Historial";
import { isOneDayBeforeTrialEnd } from './utils/trialUtils';
import { sendReminderEmail } from './services/emailService';
import Footer from "./Components/Footer";
import { SuperAdminProvider } from "./context/SuperAdminContext";
import EstadisticasTiendas from "./adminSistema/pages/EstadisticasTiendas";
import CuponesDescuento from "./adminSistema/pages/CuponesDescuentos";
import ContratarServicio from "./dominios/ContratarServicio";

export default function App() {
  const user = {
    nombre: "Juani",
    email: "namor.juaningacio@gmail.com",
    fechaInicio: "2025-07-17",
  };

  useEffect(() => {
    const diasDePrueba = 7;
    if (user && user.fechaInicio && isOneDayBeforeTrialEnd(user.fechaInicio, diasDePrueba)) {
      sendReminderEmail(user.nombre, user.email, 1)
        .then(() => {
          console.log('Recordatorio enviado ✅');
        })
        .catch((err: any) => {
          console.error('Error al enviar recordatorio ❌', err);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <ClienteProvider>
        <CarritoProvider>
          <TiendaProvider>
            <SuperAdminProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/planes" element={<Planes />} />
                  <Route path="/gracias" element={<Gracias />} />
                  <Route path="/contratar-servicio" element={<ContratarServicio />} />
                  <Route path="/tienda/:slug" element={<Layout><Tienda /></Layout>} />
                  <Route path="/tienda/:slug/producto/:id" element={<Layout><ProductDetail /></Layout>} />
                  <Route path="/tienda/:slug/servicio/:id" element={<Layout><ProductDetail /></Layout>} />
                  <Route path="/tienda/:slug/checkout" element={<Layout><Checkout /></Layout>} />
                  <Route path="/tienda/:slug/forma-entrega" element={<Layout><FormaEntrega /></Layout>} />
                  <Route path="/tienda/:slug/forma-pago" element={<Layout><FormaDePago /></Layout>} />
                  <Route path="/tienda/:slug/compra-realizada" element={<Layout><CompraRealizada /></Layout>} />
                  <Route path="/tienda/:slug/datos-envio" element={<Layout><DatosEnvio /></Layout>} />
                  <Route path="/tienda/:slug/agendar-servicio/:id" element={<Layout><AgendarServicio /></Layout>} />
                  <Route path="/tienda/:slug/checkout-reserva" element={<Layout><CheckoutReserva /></Layout>} />
                  <Route path="/tienda/:slug/buscar/:termino" element={<Layout><ResultadoBusqueda /></Layout>} />
                  <Route path="/tienda/:slug/empleado/forma-pago" element={<Layout><FormaDePagoEmpleado /></Layout>} />
                  <Route path="/tienda/:slug/historial" element={<Layout><Historial /></Layout>} />
                  <Route path="/seleccionar-tienda" element={<SeleccionarTienda />} />
                  <Route path="/admin/:slug" element={<PrivateRoute><Admin /></PrivateRoute>} />
                  <Route path="/admin/:slug/pedidos" element={<PrivateRoute permiteEmpleado><Pedidos /></PrivateRoute>} />
                  <Route path="/superadmin/estadisticas" element={<EstadisticasTiendas />} />
                  <Route path="/superadmin/cupones" element={<CuponesDescuento />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </Router>
            </SuperAdminProvider>
          </TiendaProvider>
        </CarritoProvider>
      </ClienteProvider>
    </AuthProvider>
  );
}