-- Cuentas por Cobrar: esquema inicial
create table if not exists public.deudores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  direccion text,
  notas text,
  creado_en timestamptz not null default now()
);

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  deudor_id uuid not null references public.deudores (id) on delete cascade,
  tipo text not null check (tipo in ('cargo', 'abono')),
  monto numeric not null check (monto > 0),
  fecha date not null default current_date,
  nota text,
  creado_en timestamptz not null default now()
);

create index if not exists movimientos_deudor_fecha_idx
  on public.movimientos (deudor_id, fecha);

-- Vista de saldos. security_invoker = true hace que respete RLS de las tablas base.
create or replace view public.v_saldos with (security_invoker = true) as
select
  d.id,
  d.nombre,
  d.telefono,
  d.direccion,
  d.notas,
  d.creado_en,
  coalesce(sum(m.monto) filter (where m.tipo = 'cargo'), 0)::numeric as total_cargos,
  coalesce(sum(m.monto) filter (where m.tipo = 'abono'), 0)::numeric as total_abonos,
  (coalesce(sum(m.monto) filter (where m.tipo = 'cargo'), 0)
    - coalesce(sum(m.monto) filter (where m.tipo = 'abono'), 0))::numeric as saldo,
  max(m.fecha) as fecha_ultimo_movimiento
from public.deudores d
left join public.movimientos m on m.deudor_id = d.id
group by d.id;

-- RLS
alter table public.deudores enable row level security;
alter table public.movimientos enable row level security;

create policy "acceso total autenticado" on public.deudores
  for all to authenticated using (true) with check (true);
create policy "acceso total autenticado" on public.movimientos
  for all to authenticated using (true) with check (true);
