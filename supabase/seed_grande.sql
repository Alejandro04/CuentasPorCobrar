-- Seed grande para probar paginación: 30 clientes y 750 movimientos (25 por cliente).
-- 30 clientes > 20/pág  → pagina la lista de clientes.
-- 25 movimientos > 20/pág → pagina las deudas de cada cliente.
-- Ejecutar en el SQL Editor de Supabase. Requiere las migraciones 0001 y 0002.
begin;

with clientes as (
  insert into public.deudores (nombre, cedula, telefono)
  select
    'Cliente ' || lpad(g::text, 2, '0'),
    (2000000000 + g)::text,
    '30' || lpad(g::text, 8, '0')
  from generate_series(1, 30) g
  returning id
),
ids as (select id, row_number() over () as rn from clientes)
insert into public.movimientos (deudor_id, tipo, monto, fecha, nota)
select
  (select id from ids where rn = ((g - 1) % 30) + 1),       -- 25 movimientos por cliente
  case when random() < 0.7 then 'cargo' else 'abono' end,   -- mayoría cargos (deuda)
  (floor(random() * 20) + 1) * 5000,                        -- 5.000 a 100.000
  current_date - (floor(random() * 180))::int,              -- últimos ~6 meses
  'Movimiento de prueba'
from generate_series(1, 750) g;

commit;
