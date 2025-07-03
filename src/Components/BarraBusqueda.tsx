import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/BarraBusqueda.css";

export default function BarraBusqueda() {
  const [termino, setTermino] = useState("");
  const navigate = useNavigate();
  const { slug } = useParams();  // ✅ Tomamos el slug de la URL

  const buscarProducto = () => {
    if (termino.trim() === "") return;
    navigate(`/tienda/${slug}/buscar/${encodeURIComponent(termino)}`);
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
      <span className="nombre-tienda">
        {slug ? `en ${slug}` : "Tu tienda"}
      </span>
      <button onClick={buscarProducto}>
        🔍
      </button>
    </div>
  );
}
