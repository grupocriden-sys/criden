# CRIDEN — boceto inicial

Next.js App Router + TypeScript + Tailwind. Hosting previsto: Vercel.

## Ejecutar

Requiere Node.js >= 20.9.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:3000. Validar con `npm run typecheck` y `npm run build`.

## Qué incluye

- Inicio ES/EN con nosotros, equipo, proyectos y contacto.
- Perfiles reutilizables y caso de estudio Super Gol Kids.
- Contenido editable en `content/`, separado de los componentes.
- Diseño adaptable, enlaces reales, foco visible y movimiento reducido.
- Metadata, favicon, robots y sitemap (requiere NEXT_PUBLIC_SITE_URL).
- Documento original incorporado como CLAUDE.md.

Las iniciales sustituyen fotografías pendientes. La ilustración de Super Gol Kids es conceptual, no una captura real. No se inventaron CV, apellidos, enlaces, correos ni testimonios.

## Límites del boceto

TinaCMS, Supabase, Google Calendar y formulario de contacto todavía no están conectados. `/admin` y `/workspace` solo muestran avisos de configuración y NO sirven datos privados. No habilitar funciones privadas hasta implementar autenticación en servidor y RLS. El código está cargado en `grupocriden-sys/criden`. Vercel todavía no está conectado ni desplegado.

## Subir a GitHub

Crear un repositorio vacío llamado `criden-web` en https://github.com/new, preferiblemente privado. No inicializarlo con README porque este proyecto ya lo incluye.

```bash
git init -b main
git add .
git commit -m "feat: crear boceto público de Criden"
git remote add origin https://github.com/TU_USUARIO/criden-web.git
git push -u origin main
```

En Vercel: Add New → Project → Import `criden-web`. Configurar NEXT_PUBLIC_SITE_URL con el dominio real. No cargar secretos en GitHub.

## Acceso privado (Supabase + Google)

- `/admin` y `/workspace` exigen sesión; sin ella redirigen a `/login`.
- Solo entra la cuenta registrada en `public.allowed_accounts` (grupocriden@gmail.com). Se valida en servidor (`lib/auth/account.ts`) y en la base con `public.is_allowed()`.
- Migraciones en `supabase/migrations/`: ejecutarlas en Supabase → SQL Editor.
- Variables necesarias en `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Siguiente fase

Ver la sección 0 del CLAUDE.md: login con Google, admin propio sobre Supabase y sala de trabajo. La preview HTML es una maqueta autónoma del inicio ES para revisar sin instalar herramientas; la implementación oficial está en `app/`.

## Verificación de esta entrega

`npm run typecheck` y `npm run build` completados correctamente con Next.js 16.3.8. `boceto.html` es una captura HTML autónoma del inicio real generado por Next.js; los enlaces de perfiles e idioma están simplificados en esa captura. Para navegar todas las rutas ejecutar la aplicación.
