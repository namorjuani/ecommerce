// src/components/BarraBusqueda.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSearch } from "react-icons/fa";
import "./css/BarraBusqueda.css";

export default function BarraBusqueda() {
  const [termino, setTermino] = useState("");
  const navigate = useNavigate();
  const { tiendaNombre } = useAuth(); // Asegurate de exponer tiendaNombre desde AuthContext

  const buscarProducto = () => {
    if (termino.trim() === "") return;
    navigate(`/buscar/${encodeURIComponent(termino)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") buscarProducto();
  };

  return (
    <div className="barra-busqueda-container">
      <input
        type="text"
        placeholder="Buscar productos, marcas y más..."
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <span className="nombre-tienda">en {tiendaNombre || "Tu tienda"}</span>
      <button onClick={buscarProducto}>
        <FaSearch />
      </button>
    </div>
  );
}
