// Cliente mínimo para la API pública del CRM de WhatsApp (crm.creatingbara.com/api/v1).
// Usa una API key con scopes contacts:write + messages:send (Worker secret WACRM_API_KEY).

const CRM_BASE = 'https://crm.creatingbara.com/api/v1';

async function crmFetch(env, path, options = {}) {
  if (!env.WACRM_API_KEY) return { ok: false, error: 'CRM no configurado (falta WACRM_API_KEY).' };
  const res = await fetch(CRM_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.WACRM_API_KEY}`,
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, status: res.status, error: json.error?.message || 'Error del CRM.' };
  return { ok: true, data: json.data };
}

export async function upsertCrmContact(env, { phone, name }) {
  return crmFetch(env, '/contacts', {
    method: 'POST',
    body: JSON.stringify({ phone, name, tags: ['demo-agenda'] }),
  });
}

// Envía un mensaje de plantilla (requiere aprobación previa de Meta).
// Si la plantilla aún no está aprobada, esto falla de forma segura (no rompe la reserva).
export async function sendCrmTemplateMessage(env, { phone, templateName, language = 'es', params = [] }) {
  return crmFetch(env, '/messages', {
    method: 'POST',
    body: JSON.stringify({
      to: phone,
      type: 'template',
      template: { name: templateName, language, params },
    }),
  });
}
