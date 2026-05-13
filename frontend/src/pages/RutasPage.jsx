import { useState, useEffect } from 'react';
import RutasUpload from '../components/RutasUpload';

const COLUMNS = [
  { key: 'vendedor',       label: 'Vendedor' },
  { key: 'co_ven',         label: 'Co. Ven.' },
  { key: 'zona',           label: 'Zona' },
  { key: 'coordenadas',    label: 'Coordenadas' },
  { key: 'dias_rec_ruta_1',label: 'Días Recep.' },
  { key: 'ruta_1',         label: 'Ruta' },
  { key: 'tiempo_mas',     label: 'Tiempo' },
  { key: 'observacion',    label: 'Observación' },
  { key: 'lunes',          label: 'L' },
  { key: 'martes',         label: 'M' },
  { key: 'miercoles',      label: 'MI' },
  { key: 'jueves',         label: 'J' },
  { key: 'viernes',        label: 'V' },
  { key: 'sabado',         label: 'S' },
  { key: 'clientes_me',    label: 'Clientes Merc.' },
  { key: 'clientes_cris',  label: 'Clientes Crist' },
  { key: 'activos_crist',  label: 'Activos Crist' },
  { key: 'inactivos',      label: 'Inactivos' },
  { key: 'unidades_m',     label: 'Unid. Merc.' },
  { key: 'unidades_cr',    label: 'Unid. Crist' },
  { key: 'peso_unid',      label: 'Peso Unid.' },
  { key: 'peso_cliente',   label: 'Peso Cliente' },
];

export default function RutasPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rutas/data');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <RutasUpload onSuccess={fetchData} />
      <div style={styles.tableWrap}>
        {loading ? (
          <p style={styles.empty}>Cargando datos...</p>
        ) : data.length === 0 ? (
          <p style={styles.empty}>Sin registros. Sube un Excel de rutas para comenzar.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} style={styles.th}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  {COLUMNS.map((c) => (
                    <td key={c.key} style={styles.td}>{row[c.key] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { background: '#7c3aed', color: '#fff', padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  empty: { padding: '2rem', textAlign: 'center', color: '#64748b' },
};
