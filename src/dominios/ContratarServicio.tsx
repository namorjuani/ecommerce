import { useState, useEffect } from "react";
import "../pages/css/ContratarServicio.css";
import { useSearchParams } from "react-router-dom";

export default function ContratarServicio() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [nombreTienda, setNombreTienda] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const tienda = searchParams.get("nombreTienda");
        const correo = searchParams.get("email");
        if (tienda) setNombreTienda(tienda);
        if (correo) setEmail(correo);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://us-central1-applavaderoartesanal.cloudfunctions.net/crearPreferenciaFunction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, nombreTienda }),
            });

            const data = await response.json();
            if (!data.init_point) throw new Error("No se pudo crear la preferencia de pago");

            window.location.href = data.init_point;
        } catch (err: any) {
            setError("❌ Ocurrió un error al iniciar el pago. Verificá tus datos.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pago-container">
            <div className="pago-card">
                <h2>Activá tu tienda</h2>
                <p className="pago-descripcion">
                    Para comenzar a usar tu tienda, aboná la suscripción mensual. Solo necesitás completar tus datos y pagar con MercadoPago.
                </p>

                <form className="pago-form" onSubmit={handleSubmit}>
                    <label>
                        Correo electrónico
                        <input
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Nombre de la tienda
                        <input
                            type="text"
                            placeholder="mitienda"
                            value={nombreTienda}
                            onChange={(e) => setNombreTienda(e.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Redirigiendo..." : "Pagar con MercadoPago"}
                    </button>

                    {error && <p className="pago-error">{error}</p>}
                </form>
            </div>
        </div>
    );
}
