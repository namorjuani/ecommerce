import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CompraRealizada() {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      icon: "success",
      title: "¡Compra realizada!",
      text: "Gracias por tu compra. Serás redirigido al inicio.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });

    const timeout = setTimeout(() => {
      navigate("/");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <p>Redirigiendo al inicio...</p>
      <button
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#3483fa",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Ir al inicio ahora
      </button>
    </div>
  );
}
