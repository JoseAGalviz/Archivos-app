import { useState, useEffect } from 'react';
import UploadExcel from './components/UploadExcel';

const COLUMNS = [
  { key: 'sicm', label: 'SICM' },
  { key: 'rif', label: 'RIF' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'clasificacion', label: 'Clasificación' },
  { key: 'cantidad_doc_e', label: 'Cant. Doc.E' },
  { key: 'promedio_mora', label: 'Prom. Mora' },
  { key: 'cod_juan_bd', label: 'Cod Juan BD' },
  { key: 'ejecutiva', label: 'Ejecutiva' },
  { key: 'codigo_profit', label: 'Cód. Profit' },
  { key: 'vendedor', label: 'Vendedor' },
  { key: 'cod_profit', label: 'Cod Profit' },
  { key: 'user_app', label: 'User App' },
  { key: 'unid_mensual', label: 'Unid Mensual' },
  { key: 'crist_mensual', label: 'Crist Mensual' },
  { key: 'peso_drogueria', label: 'Peso Droguería' },
  { key: 'ultima_compra', label: 'Última Compra' },
  { key: 'municipio_parroquia', label: 'Municipio/Parroquia' },
  { key: 'contacto_farmap', label: 'Contacto FarmaP' },
  { key: 'numero', label: 'Número' },
  { key: 'numero2', label: 'Número 2' },
];

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload/data');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncProfit = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/sync/profit', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al sincronizar');
      setSyncMsg({ type: 'success', msg: `${json.updated} registros actualizados desde Profit` });
      fetchData();
    } catch (err) {
      setSyncMsg({ type: 'error', msg: err.message });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>Sistema de Auditoría</h1>
      <UploadExcel onSuccess={fetchData} />
      <div style={styles.syncBar}>
        <button onClick={syncProfit} disabled={syncing} style={styles.syncBtn}>
          {syncing ? 'Sincronizando...' : 'Sincronizar desde Profit'}
        </button>
        {syncMsg && (
          <span style={{ color: syncMsg.type === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {syncMsg.msg}
          </span>
        )}
      </div>

      <div style={styles.tableWrap}>
        {loading ? (
          <p>Cargando datos...</p>
        ) : data.length === 0 ? (
          <p style={styles.empty}>Sin registros. Sube un Excel para comenzar.</p>
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
                <tr key={row.id} style={styles.tr}>
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
  root: { fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#f1f5f9', minHeight: '100vh' },
  syncBar: { display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 480, margin: '0 auto 2rem' },
  syncBtn: { padding: '0.5rem 1.25rem', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  heading: { textAlign: 'center', marginBottom: '2rem', color: '#1e293b' },
  tableWrap: { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { background: '#2563eb', color: '#fff', padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  tr: { ':hover': { background: '#f8fafc' } },
  empty: { padding: '2rem', textAlign: 'center', color: '#64748b' },
};
