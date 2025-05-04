const finalizarCompra = async () => {
    const resumen = carrito.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        cantidad: prod.cantidad,
        subtotal: prod.precio * (prod.cantidad || 1),
    }));

    console.log("Compra realizada:", resumen);

    // 🔥 Actualizamos stock en Firebase antes de vaciar carrito y redirigir
    const tiendaId = localStorage.getItem("userId");

    if (!tiendaId) {
        alert("Error: no se encontró el ID de la tienda");
        return;
    }

    for (const producto of carrito) {
        const ref = doc(db, "tiendas", tiendaId, "productos", producto.id!);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            const nuevoStock = Math.max(0, (data.stock || 0) - (producto.cantidad || 1));
            await updateDoc(ref, { stock: nuevoStock });
        }
    }

    vaciarCarrito();

    await Swal.fire({
        icon: "success",
        title: "¡Compra exitosa!",
        text: "Tu pedido ha sido registrado correctamente.",
        confirmButtonText: "Volver a la tienda",
        confirmButtonColor: "#28a745",
    });

    window.location.href = "/";
};
