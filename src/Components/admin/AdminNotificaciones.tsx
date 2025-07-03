export default function AdminNotificaciones({
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
            <h3>Configuración de notificaciones</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
                <label>
                    Correo de notificación
                    <input
                        value={config.correoNotificacion || ""}
                        onChange={(e) => setConfig({ ...config, correoNotificacion: e.target.value })}
                    />
                </label>
                <label>
                    WhatsApp de notificación
                    <input
                        value={config.whatsappNotificacion || ""}
                        onChange={(e) => setConfig({ ...config, whatsappNotificacion: e.target.value })}
                    />
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={config.recibirPorCorreo || false}
                        onChange={(e) => setConfig({ ...config, recibirPorCorreo: e.target.checked })}
                    />
                    Recibir notificaciones por correo
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={config.recibirPorWhatsapp || false}
                        onChange={(e) => setConfig({ ...config, recibirPorWhatsapp: e.target.checked })}
                    />
                    Recibir notificaciones por WhatsApp
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
        </>
    );
}
