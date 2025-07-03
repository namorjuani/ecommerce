export default function VistaPreviaTienda({
    logo,
    nombre,
    descripcion,
    imagen,
    textoHero,
    colorFondo,
    colorBoton,
    instagram,
    facebook,
    tiktok,
    googleMaps,
    posicionBanner,
    tamañoBanner
}: {
    logo: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    textoHero: string;
    colorFondo: string;
    colorBoton: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    googleMaps: string;
    posicionBanner: string;
    tamañoBanner: string;
}) {
    return (
        <div
            style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "1.5rem",
                backgroundColor: colorFondo
            }}
        >
            <h4>Vista previa</h4>
            <div style={{ textAlign: "center" }}>
                {logo && <img src={logo} alt="Logo" style={{ maxWidth: "150px", marginBottom: "1rem" }} />}
                <h2>{nombre}</h2>
                <p>{descripcion}</p>
                {imagen && (
                    <div
                        style={{
                            backgroundImage: `url(${imagen})`,
                            backgroundPosition: posicionBanner,
                            backgroundSize: tamañoBanner,
                            height: "200px",
                            width: "100%",
                            marginBottom: "1rem",
                            backgroundRepeat: "no-repeat"
                        }}
                    ></div>
                )}
                <p>{textoHero}</p>
                <div style={{ margin: "1rem 0" }}>
                    {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}{" "}
                    {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}{" "}
                    {tiktok && <a href={tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
                </div>
                {googleMaps && (
                    <div
                        dangerouslySetInnerHTML={{ __html: googleMaps }}
                        style={{ maxWidth: "100%", overflow: "hidden" }}
                    />
                )}
                <button style={{ backgroundColor: colorBoton, color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
                    Botón ejemplo
                </button>
            </div>
        </div>
    );
}
