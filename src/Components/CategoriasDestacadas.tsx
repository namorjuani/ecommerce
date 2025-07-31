
interface Props {
    categoria1?: string;
    categoria2?: string;
    categoriasExtras?: string[];
    setCategoriaFiltrada: (cat: string | null) => void;
}

export default function CategoriasDestacadas({
    categoria1 = "",
    categoria2 = "",
    categoriasExtras = [],
    setCategoriaFiltrada,
}: Props) {
    const mostrarMas = categoriasExtras.length > 0;
    const categoriasRestantes = categoriasExtras.filter(
        (cat) => cat !== categoria1 && cat !== categoria2
    );

    return (
        <div className="categorias-destacadas-container">
            {categoria1 && (
                <button onClick={() => setCategoriaFiltrada(categoria1)}>
                    {categoria1}
                </button>
            )}
            {categoria2 && (
                <button onClick={() => setCategoriaFiltrada(categoria2)}>
                    {categoria2}
                </button>
            )}

            {mostrarMas && categoriasRestantes.length > 0 && (
                <>
                    <button
                        className="btn-mas-categorias"
                        onClick={() => setCategoriaFiltrada(null)}
                    >
                        Más categorías
                    </button>
                    <div className="categorias-extras">
                        {categoriasRestantes.map((cat) => (
                            <button key={cat} onClick={() => setCategoriaFiltrada(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
