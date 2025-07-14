import VistaPreviaTienda from "./VistaPreviaTienda";
import EsteticaCategorias from "./EsteticaCategorias";

interface Props {
    config: any;
    setConfig: (c: any) => void;
    guardarConfiguracion: () => void;
}

export default function EsteticaGeneral({
    config,
    setConfig,
    guardarConfiguracion
}: Props) {
    return (
        <>
            <h3>Configuración visual de la tienda</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label>Logo (URL)
                    <input value={config.logo} onChange={(e) => setConfig({ ...config, logo: e.target.value })} />
                </label>
                <label>Nombre de la tienda
                    <input value={config.nombre} onChange={(e) => setConfig({ ...config, nombre: e.target.value })} />
                </label>
                <label>Descripción de la tienda
                    <textarea value={config.descripcion} onChange={(e) => setConfig({ ...config, descripcion: e.target.value })} />
                </label>
                <label>Imagen principal (URL)
                    <input value={config.imagen} onChange={(e) => setConfig({ ...config, imagen: e.target.value })} />
                </label>
                <label>Texto principal (Hero)
                    <input value={config.textoHero} onChange={(e) => setConfig({ ...config, textoHero: e.target.value })} />
                </label>
                <label>WhatsApp para contacto y agendar servicios
                    <input value={config.whatsapp} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} />
                </label>
                <label>Color de fondo
                    <input type="color" value={config.colorFondo} onChange={(e) => setConfig({ ...config, colorFondo: e.target.value })} />
                </label>
                <label>Color de botones
                    <input type="color" value={config.colorBoton} onChange={(e) => setConfig({ ...config, colorBoton: e.target.value })} />
                </label>
                <label>Link de Instagram
                    <input value={config.linkInstagram} onChange={(e) => setConfig({ ...config, linkInstagram: e.target.value })} />
                </label>
                <label>Link de Facebook
                    <input value={config.linkFacebook} onChange={(e) => setConfig({ ...config, linkFacebook: e.target.value })} />
                </label>
                <EsteticaCategorias config={config} setConfig={setConfig} guardarConfiguracion={guardarConfiguracion} />
                <label>Mapa (iframe Google Maps)
                    <textarea value={config.googleMaps} onChange={(e) => setConfig({ ...config, googleMaps: e.target.value })} />
                </label>
                <label>Texto informativo junto al mapa
                    <textarea value={config.textoUbicacion} onChange={(e) => setConfig({ ...config, textoUbicacion: e.target.value })} />
                </label>
                <label>Posición del banner
                    <input value={config.posicionBanner} onChange={(e) => setConfig({ ...config, posicionBanner: e.target.value })} />
                </label>
                <label>Tamaño del banner
                    <input value={config.tamañoBanner} onChange={(e) => setConfig({ ...config, tamañoBanner: e.target.value })} />
                </label>
            </div>

            <button
                onClick={guardarConfiguracion}
                style={{
                    marginTop: "1rem",
                    backgroundColor: "#3483fa",
                    color: "white",
                    border: "none",
                    padding: "0.7rem 1.2rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                💾 Guardar configuración
            </button>

            <VistaPreviaTienda
                logo={config.logo || ""}
                nombre={config.nombre || ""}
                descripcion={config.descripcion || ""}
                imagen={config.imagen || ""}
                textoHero={config.textoHero || ""}
                colorFondo={config.colorFondo || "#ffffff"}
                colorBoton={config.colorBoton || "#3483fa"}
                instagram={config.instagram || ""}
                facebook={config.facebook || ""}
                tiktok={config.tiktok || ""}
                googleMaps={config.googleMaps || ""}
                posicionBanner={config.posicionBanner || "center"}
                tamañoBanner={config.tamañoBanner || "cover"}
            />
        </>
    );
}
