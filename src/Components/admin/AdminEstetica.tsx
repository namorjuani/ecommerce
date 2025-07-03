import EsteticaGeneral from "./Estetica/EsteticaGeneral";

export default function AdminEstetica({
    config,
    setConfig,
    guardarConfiguracion,
}: {
    config: any;
    setConfig: (c: any) => void;
    guardarConfiguracion: () => void;
}) {
    return (
        <EsteticaGeneral
            config={config}
            setConfig={setConfig}
            guardarConfiguracion={guardarConfiguracion}
        />
    );
}
