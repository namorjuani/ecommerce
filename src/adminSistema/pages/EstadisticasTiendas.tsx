import SolicitarPin from "../components/SolicitarPin";

export default function EstadisticasTiendas() {
    return (
        <SolicitarPin>
            <div style={{ padding: "2rem" }}>
                <h1>📊 Estadísticas del sistema</h1>
                <ul>
                    <li>Tiendas activas: 13</li>
                    <li>Tiendas en prueba gratuita: 5</li>
                    <li>Tiendas suspendidas: 2</li>
                    <li>Tiendas eliminadas: 0</li>
                </ul>
            </div>
        </SolicitarPin>
    );
}
