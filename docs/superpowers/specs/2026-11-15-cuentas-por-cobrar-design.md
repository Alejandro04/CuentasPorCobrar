# Diseño: Cuentas por Cobrar para comercios

Fecha: 2026-11-15
Estado: Aprobado por el usuario

## Resumen

Aplicación web sencilla e intuitiva de cuentas por cobrar para comercios, que reemplaza el cuaderno físico. Permite registrar deudores con cuenta corriente (varios cargos y abonos), recalcular el saldo automáticamente, filtrar por nombre o fecha, y generar listados de deudores con antigüedad de 3 y 6 meses.

## Decisiones tomadas

- **Uso**: varias personas / varios dispositivos → base de datos compartida en servidor.
- **Base de datos**: Supabase (Postgres) en la nube, plan gratuito.
- **Acceso**: contraseña única compartida (un solo usuario de Supabase Auth; el login pide solo la contraseña).
- **Modelo de deuda**: cuenta corriente por deudor (múltiples cargos y abonos con fecha propia).
- **Antigüedad**: se cuenta desde la fecha del cargo más antiguo sin saldar, aplicando abonos en orden FIFO.
- **Ficha del deudor**: Nombre (obligatorio), Teléfono, Dirección, Notas.
- **Moneda**: peso colombiano (COP), formato `$ 1.234.567` (punto de miles, sin decimales).
- **Correcciones**: se permite editar y eliminar movimientos y deudores, con confirmación.

## Arquitectura

Stack: Next.js 16 (App Router) + React 19 + Tailwind 4 + `@supabase/ssr` + Supabase (Postgres).

- Todas las mutaciones (crear/editar/eliminar deudores y movimientos) se realizan vía **Server Actions**.
- El navegador nunca accede directamente a Postgres; las consultas pasan por el servidor con el cliente de Supabase.
- La sesión de auth vive en **cookies httpOnly**; el middleware de Next protege todas las rutas excepto `/login`.
- Nota: la versión de Next.js del proyecto puede diferir de versiones conocidas; antes de escribir código se consultará la documentación incluida en `node_modules/next/dist/docs/`.

### Autenticación

- Un único usuario de Supabase Auth creado manualmente durante la configuración. Su email se guarda en `.env.local` (`APP_AUTH_EMAIL`).
- La pantalla de login pide solo la contraseña y ejecuta `signInWithPassword` con el email fijo del entorno.
- Middleware: si no hay sesión activa, redirige a `/login`. `Cerrar sesión` disponible en el encabezado.

## Modelo de datos

```
deudores                          movimientos
──────────────────────            ──────────────────────
id          uuid PK               id         uuid PK
nombre      text NOT NULL         deudor_id  uuid FK → deudores (ON DELETE CASCADE)
telefono    text                  tipo       text CHECK (tipo IN ('cargo','abono'))
direccion   text                  monto      numeric CHECK (monto > 0)
notas       text                  fecha      date NOT NULL DEFAULT CURRENT_DATE
creado_en   timestamptz           nota       text
                                  creado_en  timestamptz
```

- Índice: `movimientos(deudor_id, fecha)`. La búsqueda por nombre usa `ILIKE '%texto%'` sin índice adicional (el volumen de deudores de un comercio es pequeño y no lo justifica).
- **RLS habilitado** en ambas tablas: políticas de select/insert/update/delete permitidas solo para el usuario autenticado.

### Saldo

Vista SQL `v_saldos`:

```sql
CREATE VIEW v_saldos WITH (security_invoker = true) AS
SELECT d.id,
       COALESCE(SUM(m.monto) FILTER (WHERE m.tipo = 'cargo'), 0) AS total_cargos,
       COALESCE(SUM(m.monto) FILTER (WHERE m.tipo = 'abono'), 0) AS total_abonos,
       COALESCE(SUM(m.monto) FILTER (WHERE m.tipo = 'cargo'), 0)
         - COALESCE(SUM(m.monto) FILTER (WHERE m.tipo = 'abono'), 0) AS saldo,
       MAX(m.fecha) AS fecha_ultimo_movimiento
FROM deudores d
LEFT JOIN movimientos m ON m.deudor_id = d.id
GROUP BY d.id;
```

El saldo nunca se almacena: siempre se deriva de los movimientos. `security_invoker = true` hace que la vista respete RLS de las tablas base (sin esto, cualquiera con la anon key pública podría leerla saltándose RLS).

### Antigüedad (FIFO)

Los abonos se aplican a los cargos más antiguos primero. La antigüedad de un deudor con `saldo > 0` es la fecha del cargo más antiguo con saldo pendiente tras aplicar los abonos FIFO.

- Se calcula en un helper TypeScript puro: `calcularAntiguedad(cargos, abonos, hoy)` en `lib/antiguedad.ts`.
- Input: listas de `{ fecha, monto }` de cargos y abonos. Output: fecha del cargo más antiguo no cubierto, o `null` si el saldo es 0.
- Regla de negocio: no se permite registrar ni editar un abono que deje el saldo en negativo. Al **editar** un abono existente, la validación compara contra el saldo excluyendo ese mismo abono.
- Deudores con saldo 0 no aparecen en los reportes de antigüedad.
- "Meses de antigüedad" = meses completos transcurridos entre la fecha del cargo y hoy (diferencia de meses truncada hacia abajo). Un deudor entra al reporte de 3 meses si esa diferencia es ≥ 3.

## Pantallas y flujos

Diseño mobile-first (uso típico desde el celular en el mostrador). Encabezado común con "Inicio", "Reportes" y "Cerrar sesión".

### `/login`

Campo de contraseña + botón "Entrar". Mensaje de error visible si la contraseña es incorrecta.

### `/` — Listado de deudores

- Búsqueda por **nombre** (filtra mientras se escribe, ILIKE `%texto%`).
- Filtro por **rango de fechas** sobre `creado_en` del deudor (desde/hasta).
- Selector de estado: **Todos / Pendientes (saldo > 0) / Pagados (saldo = 0)**.
- Lista: Nombre, Teléfono, Saldo (formato COP), Fecha último movimiento. Fila clickeable → ficha.
- Orden predeterminado: mayor saldo primero.
- Botón "Nuevo deudor" y acceso a "Reportes" (Antigüedad 3 meses / 6 meses).

### `/deudores/nuevo`

Formulario: Nombre*, Teléfono, Dirección, Notas + campos opcionales de monto y fecha de deuda inicial (si se completan, crean el primer movimiento de tipo `cargo`).

### `/deudores/[id]` — Ficha del deudor

- Cabecera: datos del deudor y **saldo actual** destacado. Botones "Editar datos" y "Eliminar deudor" (confirmación; borra en cascada sus movimientos).
- Botones "Registrar cargo" y "Registrar abono": formulario con monto*, fecha (default hoy), nota. Tras guardar, el saldo se recalcula y la vista se refresca.
- Historial cronológico de movimientos (fecha, tipo, monto, nota) con editar/eliminar por fila (eliminación con confirmación).
- Validación: abono ≤ saldo actual.

### `/reportes/antiguedad?meses=3|6`

- Deudores con saldo > 0 cuya deuda más antigua (FIFO) tiene ≥ 3 o ≥ 6 meses desde hoy.
- Columnas: Nombre, Teléfono, Saldo, Fecha deuda más antigua, Meses de antigüedad.
- Totales al pie: cantidad de deudores y suma adeudada.
- Botones "Imprimir" (CSS `@media print`; PDF vía navegador) y "Descargar CSV".

## Flujo de datos

1. Componente de servidor (RSC) consulta Supabase (tablas + `v_saldos`) y renderiza.
2. Formularios invocan Server Actions → validación zod → escritura en Postgres → `revalidatePath` → UI actualizada.
3. La antigüedad se calcula en el servidor con el helper TS sobre los movimientos de cada deudor con saldo > 0.

## Manejo de errores

- Server Actions validan con **zod** (nombre requerido, monto > 0, fecha válida, abono ≤ saldo) y devuelven errores por campo que la UI muestra junto al input.
- La base refuerza con constraints (NOT NULL, CHECK, FK cascade).
- Fallos de red/Supabase: mensaje amigable genérico ("No se pudo guardar, intenta de nuevo"), sin detalles técnicos.
- Sin estado optimista: tras cada mutación se refrescan los datos del servidor.
- Eliminaciones siempre con diálogo de confirmación.

## Pruebas

- **vitest** (devDependency) para lógica pura:
  - `calcularAntiguedad` (casos FIFO: abonos parciales, totales, múltiples cargos, fechas límite de 3/6 meses).
  - Formateo de moneda COP.
  - Esquemas zod de validación.
- Verificación manual del flujo completo contra el dev server (login → alta deudor → cargo → abono → filtros → reportes → impresión/CSV).
- Puertas de calidad: `npm run lint` y `tsc --noEmit`.

## Puesta en marcha (una sola vez)

1. Crear proyecto gratuito en Supabase.
2. Ejecutar el SQL de `supabase/migrations/` (tablas, índices, vista `v_saldos`, RLS) y crear el usuario de auth compartido.
3. Configurar `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `APP_AUTH_EMAIL`.
4. `npm run dev`.

## Fuera de alcance (YAGNI)

Multi-tienda, usuarios individuales, recordatorios/WhatsApp, intereses por mora, dashboards de estadísticas, tiempo real (Supabase Realtime), exportación a Excel compleja.
