# Global API


# MailMasivo — Integración al GlobalApi

## Archivos a copiar en tu proyecto

```
src/
├── app.module.ts                          
├── mail/
│   ├── mail.module.ts
│   └── mail.service.ts
├── campaigns/
│   ├── campaigns.module.ts
│   ├── campaigns.service.ts
│   ├── campaigns.controller.ts
│   ├── dto/campaign.dto.ts
│   └── entities/campaign.entity.ts
├── recipients/
│   ├── recipients.module.ts
│   ├── recipients.service.ts
│   ├── recipients.controller.ts
│   ├── dto/recipient.dto.ts
│   └── entities/
│       ├── recipient.entity.ts
│       └── send-log.entity.ts
├── templates/
│   ├── templates.module.ts
│   ├── templates.service.ts
│   ├── templates.controller.ts
│   ├── dto/template.dto.ts
│   └── entities/template.entity.ts
└── dashboard/
    ├── dashboard.module.ts
    └── dashboard.controller.ts
```

## 1. Instalar dependencia

```bash
npm install resend
```

## 2. Agregar variables al .env

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=MailMasivo <noreply@tudominio.com>
```

> Para pruebas sin dominio propio usa `onboarding@resend.dev` como MAIL_FROM,
> pero Resend solo entregará a tu propio email registrado.

## 3. Endpoints disponibles

### Dashboard
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /api/dashboard/metrics  | Métricas del dashboard   |

### Campaigns
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/campaigns              | Crear campaña                     |
| GET    | /api/campaigns              | Listar campañas                   |
| GET    | /api/campaigns/:id          | Detalle de campaña                |
| PATCH  | /api/campaigns/:id          | Actualizar campaña (solo borrador)|
| DELETE | /api/campaigns/:id          | Eliminar campaña                  |
| POST   | /api/campaigns/:id/send     | Enviar campaña                    |
| GET    | /api/campaigns/:id/logs     | Log de envíos                     |

### Recipients
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/recipients             | Crear destinatario                |
| POST   | /api/recipients/import      | Importar múltiples (desde CSV)    |
| GET    | /api/recipients             | Listar destinatarios              |
| GET    | /api/recipients/:id         | Detalle de destinatario           |
| PATCH  | /api/recipients/:id         | Actualizar destinatario           |
| DELETE | /api/recipients/:id         | Eliminar destinatario             |

### Templates
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/templates              | Crear plantilla                   |
| GET    | /api/templates              | Listar plantillas                 |
| GET    | /api/templates/:id          | Detalle de plantilla              |
| PATCH  | /api/templates/:id          | Actualizar plantilla              |
| DELETE | /api/templates/:id          | Eliminar plantilla                |

## 4. Variables de personalización en emails

En el cuerpo y asunto del email puedes usar:

- `{nombre}`  → nombre del destinatario
- `{email}`   → email del destinatario
- `{empresa}` → (extensible vía tags/metadata futuro)
- `{ciudad}`  → (extensible)

## 5. Flujo de envío

```
POST /api/campaigns/:id/send
Body: { "recipientIds": [] }  ← vacío = todos los activos
```

El servicio:
1. Obtiene los destinatarios
2. Interpola variables en subject y body
3. Envía via Resend con delay de 600ms entre correos
4. Guarda un SendLog por cada envío (exitoso o fallido)
5. Actualiza stats en la campaña (sentCount, failedCount)
