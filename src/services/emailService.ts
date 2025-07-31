import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_irw1yqp';
const TEMPLATE_WELCOME_ID = 'template_h8vpun7';   // ✅ Plantilla de bienvenida
const TEMPLATE_REMINDER_ID = 'template_aavdqa9';  // ✅ Plantilla de recordatorio de prueba
const PUBLIC_KEY = 'ist_lonzAzdm1qX0J';

/**
 * ✉️ Email de bienvenida
 * @param toName Nombre de la persona
 * @param toEmail Email de destino
 * @param days Cantidad de días de prueba (ej: 15 o 30)
 */
export const sendWelcomeEmail = (toName: string, toEmail: string, days: number) => {
    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_WELCOME_ID,
        {
            name: toName,
            email: toEmail,
            days, // Por si tu plantilla de bienvenida dice "Tenés X días de prueba"
        },
        PUBLIC_KEY
    );
};

/**
 * ⏰ Recordatorio automático cuando está por terminar la prueba
 * @param toName Nombre de la persona
 * @param toEmail Email de destino
 * @param daysLeft Días restantes (ej: 1 día antes del vencimiento)
 */
export const sendReminderEmail = (toName: string, toEmail: string, daysLeft: number) => {
    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_REMINDER_ID,
        {
            name: toName,
            email: toEmail,
            daysLeft, // Lo usás en: "tu prueba gratuita termina en {{daysLeft}} día"
        },
        PUBLIC_KEY
    );
};
