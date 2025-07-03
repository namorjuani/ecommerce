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
            <h3>Configuración de pagos</h3>

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
