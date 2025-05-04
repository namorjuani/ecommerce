import { createContext, useContext, useState } from "react";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  tipo: "producto" | "servicio";
  cantidad?: number; // agregado
}

interface CarritoContextType {
  carrito: Producto[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (productoId: string) => void;
  actualizarCantidad: (productoId: string, nuevaCantidad: number) => void;
  calcularTotal: () => number;
  vaciarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = useState<Producto[]>([]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.id === producto.id);

      if (existente) {
        return prev.map((p) =>
          p.id === producto.id && p.cantidad! < p.stock
            ? { ...p, cantidad: p.cantidad! + 1 }
            : p
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((p) => p.id !== productoId));
  };

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === productoId
          ? { ...p, cantidad: Math.max(1, Math.min(nuevaCantidad, p.stock)) }
          : p
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, p) => total + p.precio * (p.cantidad || 1), 0);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        calcularTotal,
        vaciarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
  return context;
}
