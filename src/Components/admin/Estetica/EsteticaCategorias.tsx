interface Config {
  categoriaDestacada1?: string;
  categoriaDestacada2?: string;
  [key: string]: any; // Para permitir otras propiedades sin romper
}

interface Props {
  config: Config;
  setConfig: (c: Config) => void;
  guardarConfiguracion: () => void;
}

export default function EsteticaCategorias({
  config,
  setConfig,
  guardarConfiguracion
}: Props) {
  return (
    <div>
      <h4>Categorías destacadas</h4>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Categoría 1
        <input
          value={config.categoriaDestacada1 || ""}
          onChange={(e) => setConfig({ ...config, categoriaDestacada1: e.target.value })}
          style={{ width: "100%", marginTop: "0.2rem" }}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Categoría 2
        <input
          value={config.categoriaDestacada2 || ""}
          onChange={(e) => setConfig({ ...config, categoriaDestacada2: e.target.value })}
          style={{ width: "100%", marginTop: "0.2rem" }}
        />
      </label>
      <button
        onClick={guardarConfiguracion}
        style={{
          marginTop: "0.5rem",
          backgroundColor: "#3483fa",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        💾 Guardar categorías
      </button>
    </div>
  );
}
