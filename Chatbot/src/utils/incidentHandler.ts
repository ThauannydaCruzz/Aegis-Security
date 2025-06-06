import { sendEmail } from '../services/emailService';
import { sendWhatsAppMessage } from '../services/whatsappService';

export async function handleEmergency(user, incident) {
  const summary = `Alerta de Segurança: ${incident.description}\nUsuário: ${user}\nData: ${new Date().toLocaleString()}`;

  // Envia e-mail para a equipe de suporte
  await sendEmail('suporte@empresa.com', '⚠️ Emergência de Cibersegurança', summary);

  // Envia mensagem no WhatsApp para o responsável
  await sendWhatsAppMessage('+5511999999999', summary);
}