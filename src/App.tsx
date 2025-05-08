import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
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
import FormaDePago from "./pages/FormaDePago"; // ✅ IMPORTANTE
import { ClienteProvider } from "./context/ClienteContext";
import DatosEnvio from "./pages/DatosEnvio";

export default function App() {
  return (
    <AuthProvider>
      <ClienteProvider>
        <CarritoProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/forma-entrega" element={<FormaEntrega />} />
                <Route path="/forma-pago" element={<FormaDePago />} />
                <Route path="/compra-realizada" element={<CompraRealizada />} />
                <Route path="/datos-envio" element={<DatosEnvio />} />
                {/* ✅ nueva ruta */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <Admin />
                    </PrivateRoute>
                  }
                />
                <Route path="/admin/pedidos" element={<Pedidos />} />
              </Routes>
            </Layout>
          </Router>
        </CarritoProvider>
      </ClienteProvider>
    </AuthProvider>
  );
}
