-- Seed de prueba: 10 clientes y 100 movimientos (10 por cliente).
-- Ejecutar en el SQL Editor de Supabase. Requiere las migraciones 0001 y 0002.
begin;

with clientes as (
  insert into public.deudores (nombre, cedula, telefono) values
    ('Ana Gómez',        '1010101010', '3001010101'),
    ('Bruno Díaz',       '1020202020', '3002020202'),
    ('Carla Ruiz',       '1030303030', '3003030303'),
    ('Diego Torres',     '1040404040', '3004040404'),
    ('Elena Patiño',     '1050505050', '3005050505'),
    ('Felipe Morales',   '1060606060', '3006060606'),
    ('Gabriela Suárez',  '1070707070', '3007070707'),
    ('Héctor Vargas',    '1080808080', '3008080808'),
    ('Irene Castaño',    '1090909090', '3009090909'),
    ('Julián Mejía',     '1101010101', '3001111111')
  returning id
),
ids as (select id, row_number() over () as rn from clientes)
insert into public.movimientos (deudor_id, tipo, monto, fecha, nota)
select
  (select id from ids where rn = ((g - 1) % 10) + 1),       -- 10 movimientos por cliente
  case when random() < 0.7 then 'cargo' else 'abono' end,   -- mayoría cargos (deuda)
  (floor(random() * 20) + 1) * 5000,                        -- 5.000 a 100.000
  current_date - (floor(random() * 180))::int,              -- últimos ~6 meses
  'Movimiento de prueba'
from generate_series(1, 100) g;

commit;
