import { sendEmail } from "../services/emailService";
import { sendWhatsAppMessage } from "../services/whatsappService";

// Chame esta função ao detectar incidentes ou ao fechar um caso
export async function notifySecurityIncident(user, incidentSummary) {
  const subject = "Alerta de Segurança - Incidente Detectado";
  const message = `Incidente: ${incidentSummary}\nUsuário: ${user}\nData: ${new Date().toLocaleString()}`;

  // Enviar e-mail para equipe de segurança
  await sendEmail("suporte@empresa.com", subject, message);

  // Enviar WhatsApp para responsável
  await sendWhatsAppMessage("+5511999999999", message);
}