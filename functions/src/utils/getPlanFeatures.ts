export function getPlanFeatures(plan: 'basico' | 'estandar' | 'premium') {
    const features = {
        basico: {
            sucursales: 1,
            cajasSimultaneas: 1,
            soporte: 'Correo',
            reportes: false,
            almacenamiento: '50 productos / 0 servicios',
        },
        estandar: {
            sucursales: 1,
            cajasSimultaneas: 1,
            soporte: 'Chat',
            reportes: true,
            almacenamiento: '500 productos / 300 servicios',
        },
        premium: {
            sucursales: 5,
            cajasSimultaneas: 5,
            soporte: 'Prioritario',
            reportes: true,
            almacenamiento: '5000 productos / 5000 servicios',
        },
    };

    return features[plan];
}
