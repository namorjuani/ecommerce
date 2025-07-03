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

export default function App() {
  return (
    <AuthProvider>
      <ClienteProvider>
        <CarritoProvider>
          <TiendaProvider>
            <Router>
              <Routes>
                {/* Página pública de tu negocio */}
                <Route path="/" element={<Landing />} />
                <Route path="/planes" element={<Planes />} />
                <Route path="/gracias" element={<Gracias />} />

                {/* Tiendas de usuarios */}
                <Route path="/tienda/:slug" element={<Layout><Tienda /></Layout>} />
                <Route path="/tienda/:slug/producto/:id" element={<Layout><ProductDetail /></Layout>} />
                <Route path="/tienda/:slug/checkout" element={<Layout><Checkout /></Layout>} />
                <Route path="/tienda/:slug/forma-entrega" element={<Layout><FormaEntrega /></Layout>} />
                <Route path="/tienda/:slug/forma-pago" element={<Layout><FormaDePago /></Layout>} />
                <Route path="/tienda/:slug/compra-realizada" element={<Layout><CompraRealizada /></Layout>} />
                <Route path="/tienda/:slug/datos-envio" element={<Layout><DatosEnvio /></Layout>} />
                <Route path="/tienda/:slug/agendar-servicio/:id" element={<Layout><AgendarServicio /></Layout>} />
                <Route path="/tienda/:slug/checkout-reserva" element={<Layout><CheckoutReserva /></Layout>} />
                <Route path="/tienda/:slug/buscar/:termino" element={<Layout><ResultadoBusqueda /></Layout>} />
                <Route path="/tienda/:slug/empleado/forma-pago" element={<Layout><FormaDePagoEmpleado /></Layout>} />
                <Route path="/seleccionar-tienda" element={<SeleccionarTienda />} />

                {/* Panel de administrador */}
                <Route path="/admin/:slug" element={
                  <PrivateRoute>
                    <Admin />
                  </PrivateRoute>
                } />
                <Route path="/admin/pedidos" element={
                  <PrivateRoute>
                    <Pedidos />
                  </PrivateRoute>
                } />

                {/* Login */}
                <Route path="/login" element={<Login />} />
              </Routes>
            </Router>
          </TiendaProvider>
        </CarritoProvider>
      </ClienteProvider>
    </AuthProvider>
  );
}
