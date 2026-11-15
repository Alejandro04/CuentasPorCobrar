# Configuración de Supabase (una sola vez)

1. Crea un proyecto gratis en https://supabase.com (anota la URL y la anon key
   de Settings → API).
2. En SQL Editor, ejecuta todo el contenido de `migrations/0001_init.sql`.
3. Crea el usuario compartido: Authentication → Users → "Add user".
   Email: el que quieras (ej. `admin@cuentas.local`), contraseña: la compartida
   del comercio. Marca "Auto Confirm User".
4. Copia `.env.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `APP_AUTH_EMAIL` (el email del paso 3)
5. `npm run dev` y entra a http://localhost:3000
