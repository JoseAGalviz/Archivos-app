import { useState } from 'react';

export default function UploadExcel({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al subir');

      setStatus({ type: 'success', msg: `${data.inserted} registros insertados` });
      setFile(null);
      e.target.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Cargar Excel</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading || !file} style={styles.btn}>
          {loading ? 'Subiendo...' : 'Subir'}
        </button>
      </form>
      {status && (
        <p style={{ ...styles.msg, color: status.type === 'success' ? '#16a34a' : '#dc2626' }}>
          {status.msg}
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: 480,
    margin: '0 auto 2rem',
  },
  title: { marginTop: 0, fontSize: '1.25rem', color: '#1e293b' },
  form: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 200 },
  btn: {
    padding: '0.5rem 1.25rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  msg: { marginTop: '1rem', fontWeight: 600 },
};
