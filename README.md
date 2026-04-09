# AURA Frontend

Frontend oficial de AURA construido con Next.js 14 para la operacion web de la plataforma multi-tenant.
Esta aplicacion consume la API de AURA Backend, integra autenticacion con Supabase y habilita operaciones administrativas y operativas por modulo.

## Tabla de contenido

1. Vision general
2. Stack tecnico
3. Estructura del proyecto
4. Variables de entorno
5. Puesta en marcha local
6. Rutas y modulos
7. Seguridad de frontend
8. Produccion y checklist de revision
9. Docker y despliegue
10. Troubleshooting
11. Convenciones de release

## Vision general

El frontend de AURA permite:

- Login por email/password + OTP.
- Verificacion reCAPTCHA para flujos web.
- Onboarding de tenant y configuracion inicial.
- Gestion de empresas, herramientas y configuracion de agente.
- Operacion diaria sobre conversaciones, citas, ordenes y catalogo.
- Operacion administrativa global (usuarios y companias).

## Stack tecnico

- Next.js 14.2.3
- React 18
- TypeScript
- Tailwind CSS
- Supabase JS (cliente web)
- SWR para consumo de datos

Scripts disponibles:

- `npm run dev`: modo desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: servidor de produccion.
- `npm run lint`: analisis estatico.

## Estructura del proyecto

```text
frontend-chatbot/
	app/                  # Rutas App Router (paginas y layouts)
	components/           # Componentes reutilizables de UI
	features/             # Vertical slices: application/data/presentation
	lib/                  # Utilidades y clientes compartidos
	public/               # Assets estaticos
```

Capas por feature:

- application: casos de uso de UI.
- data: repositorios/adaptadores de API.
- presentation: hooks y componentes de pantalla.

## Variables de entorno

Usa el archivo `.env.example` como plantilla oficial.

Pasos:

1. Copia `.env.example` a `.env`.
2. Completa valores reales para cada entorno.
3. Reinicia el servidor dev/build tras cambiar variables.

Variables principales:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS`

Notas de seguridad:

- Solo usar claves publicas con prefijo `NEXT_PUBLIC_`.
- No exponer claves privadas ni service role keys.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la unica key de Supabase permitida en frontend.

## Puesta en marcha local

### Requisitos

- Node.js 20+
- npm 10+

### Instalacion

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build de produccion

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Rutas y modulos

Rutas clave:

- `/login`
- `/login/otp`
- `/register`
- `/onboarding`
- `/setup-whatsapp`
- `/dashboard`
- `/dashboard/admin`
- `/dashboard/agent`
- `/dashboard/conversations`
- `/dashboard/orders`
- `/dashboard/appointments`
- `/dashboard/catalog`
- `/dashboard/knowledge`
- `/dashboard/tools`

Modulos funcionales principales:

- auth
- companies
- agent-config
- canned-responses
- dashboard
- knowledge
- models
- tools
- admin-global

## Seguridad de frontend

Lineamientos:

1. Nunca incluir secretos de backend en el frontend.
2. Usar exclusivamente claves publicas en variables `NEXT_PUBLIC_*`.
3. Configurar `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS` por entorno.
4. Mantener `NEXT_PUBLIC_API_URL` apuntando a HTTPS en produccion.
5. Verificar CORS en backend para dominio real del frontend.

reCAPTCHA:

- La UI exige `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` para el flujo web.
- El backend valida el token recibido en `/auth/recaptcha/verify`.

## Produccion y checklist de revision

Checklist pre-produccion:

1. Variables de entorno revisadas en hosting.
2. Dominio final configurado en `NEXT_PUBLIC_APP_URL`.
3. API productiva configurada en `NEXT_PUBLIC_API_URL`.
4. Allowed origins de server actions ajustados.
5. Lint y build exitosos.
6. Flujo login + OTP + recaptcha validado.
7. Navegacion de dashboard validada para admin y no-admin.

Checklist post-deploy:

1. Carga inicial sin errores de hydration.
2. Sin errores de red 4xx/5xx en vistas criticas.
3. Sesion Supabase estable al refrescar pagina.
4. Integracion backend funcional en operaciones de CRUD.

## Docker y despliegue

Build local:

```bash
docker build -t aura-frontend:latest .
```

Run local:

```bash
docker run --env-file .env -p 3000:3000 aura-frontend:latest
```

La imagen usa build multi-stage y ejecuta la app con `node server.js` desde el output standalone de Next.

## Troubleshooting

Problema: Missing NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY

- Solucion: completar variables en `.env` y reiniciar.

Problema: No conecta con backend

- Solucion: revisar `NEXT_PUBLIC_API_URL`, estado de API y CORS.

Problema: OTP redirecciona mal

- Solucion: validar `NEXT_PUBLIC_APP_URL` con URL real sin errores de formato.

Problema: Server Actions bloqueadas por origen

- Solucion: agregar dominio en `NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS`.

## Convenciones de release

Recomendado:

- Tags semanticos `vMAJOR.MINOR.PATCH`.
- Release notes con resumen de cambios funcionales.
- Deploy siempre desde rama `main`.

Con este baseline, AURA Frontend queda preparado para revision y despliegue productivo con una configuracion clara y segura.
