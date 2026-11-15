-- Agrega cédula al deudor y la expone en la vista de saldos (para buscar por ella).
alter table public.deudores add column if not exists cedula text;

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
  max(m.fecha) as fecha_ultimo_movimiento,
  d.cedula
from public.deudores d
left join public.movimientos m on m.deudor_id = d.id
group by d.id;
