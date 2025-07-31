import React from 'react';
import { sendWelcomeEmail } from '../services/emailService';

const WelcomeEmailTest = () => {
    const handleSendEmail = () => {
        sendWelcomeEmail('Juani', 'namor.juaningacio@gmail.com', 7)

            .then(() => {
                alert('Correo enviado correctamente ✅');
            })
            .catch((error: any) => {
                console.error('Error enviando correo:', error);
                alert('Error al enviar correo ❌');
            });
    };

    return (
        <button onClick={handleSendEmail}>
            Enviar Email de Prueba
        </button>
    );
};

export default WelcomeEmailTest;
