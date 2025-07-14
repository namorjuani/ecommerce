export default function AdminPagos({
    config,
    setConfig,
    guardarConfiguracion,
}: {
    config: any;
    setConfig: (c: any) => void;
    guardarConfiguracion: () => void;
}) {
    return (
        <>
            <h3>⚙️ Configuración de pagos</h3>

            <div style={{
                backgroundColor: "#f1f8ff",
                padding: "1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.95rem"
            }}>
                <strong>¿Cómo obtener tu Access Token y Public Key?</strong>
                <ol style={{ margin: "0.5rem 0 0 1rem", padding: 0 }}>
                    <li>Ingresá a <a href="https://www.mercadopago.com.ar/developers/panel" target="_blank" rel="noopener noreferrer">Mercado Pago Developers</a>.</li>
                    <li>Creá una nueva aplicación. Elegí un nombre y como producto seleccioná <strong>Checkout Pro</strong>.</li>
                    <li>En el apartado <strong>Credenciales</strong>, buscá la sección de <strong>credenciales de producción</strong>.</li>
                    <li>Si aún no están activadas, presioná el botón <strong>"Activar producción"</strong> y seguí los pasos para validarte.</li>
                    <li>Copiá el <strong>Access Token</strong> y la <strong>Public Key</strong> de producción y pegálos abajo.</li>
                </ol>
                <p style={{ marginTop: "0.5rem", color: "#555" }}>
                    ⚠️ Usá solo credenciales de producción para ventas reales. No compartas estas claves públicamente.
                </p>
            </div>

            <label>Access Token de Mercado Pago</label>
            <input
                value={config.mercadoPagoToken || ""}
                onChange={(e) => setConfig({ ...config, mercadoPagoToken: e.target.value })}
                placeholder="access_token_xxx"
            />

            <label>Public Key de Mercado Pago</label>
            <input
                value={config.mercadoPagoPublicKey || ""}
                onChange={(e) => setConfig({ ...config, mercadoPagoPublicKey: e.target.value })}
                placeholder="public_key_xxx"
            />

            <label>Alias de Mercado Pago</label>
            <input
                value={config.aliasMp || ""}
                onChange={(e) => setConfig({ ...config, aliasMp: e.target.value })}
            />

            <label>CBU</label>
            <input
                value={config.cbu || ""}
                onChange={(e) => setConfig({ ...config, cbu: e.target.value })}
            />

            <label>Alias bancario</label>
            <input
                value={config.aliasBancario || ""}
                onChange={(e) => setConfig({ ...config, aliasBancario: e.target.value })}
            />

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
        </>
    );
}
