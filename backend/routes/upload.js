const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const pool = require('../db/connection');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const DECIMAL_COLS = new Set(['unid_mensual', 'crist_mensual', 'peso_drogueria']);
const PERCENT_COLS = new Set(['peso_drogueria']);

function parseSpanishDecimal(val) {
  if (val === null || val === undefined) return null;
  // Excel already parsed it as a number — return directly
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (str === '-' || str === '') return null;
  // Text with Spanish format: "3.343,61" or "88,56 %"
  const clean = str.replace(/\s*%$/, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

// Map Excel header names to DB column names
const COLUMN_MAP = {
  'Sicm': 'sicm',
  'RIF': 'rif',
  'Nombre': 'nombre',
  'Clasificacion (Horar_caja en profit)': 'clasificacion_horar_caja',
  'Cantida Doc.E': 'cantidad_doc_e',
  'Promedio Mora': 'promedio_mora',
  'COD JUAN BD': 'cod_juan_bd',
  'Ejecutiva': 'ejecutiva',
  'Codigo Profit': 'codigo_profit',
  'Vendedor': 'vendedor',
  'Cod Profit': 'cod_profit',
  'User App': 'user_app',
  'Unid mensual': 'unid_mensual',
  'Crist Mensual': 'crist_mensual',
  'Peso De la drogueria': 'peso_drogueria',
  'Ultima Compra': 'ultima_compra',
  'Municipio y parroquia': 'municipio_parroquia',
  'Contacto FarmaP': 'contacto_farmap',
  'Numero': 'numero',
  'Numero  2': 'numero2',
};

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Excel vacío o sin datos' });
    }

    const dbRows = rows.map((row) => {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.trim(), v])
      );
      const mapped = {};
      for (const [excelCol, dbCol] of Object.entries(COLUMN_MAP)) {
        let raw = normalizedRow[excelCol] ?? null;
        if (typeof raw === 'string' && (raw.trim() === '#N/A' || raw.trim() === '')) raw = null;
        let val = DECIMAL_COLS.has(dbCol) ? parseSpanishDecimal(raw) : raw;
        if (PERCENT_COLS.has(dbCol) && typeof val === 'number') val = val * 100;
        mapped[dbCol] = val;
      }
      return mapped;
    });

    const columns = Object.keys(COLUMN_MAP).map((k) => COLUMN_MAP[k]);
    const BATCH_SIZE = 200;
    for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
      const batch = dbRows.slice(i, i + BATCH_SIZE);
      const placeholders = batch.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
      const values = batch.flatMap((row) => columns.map((col) => row[col]));
      await pool.query(`INSERT INTO farmacia_datos (${columns.join(', ')}) VALUES ${placeholders}`, values);
    }

    res.json({ success: true, inserted: dbRows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/debug', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const missing = Object.keys(COLUMN_MAP).filter(k => !headers.includes(k));
  res.json({ headers, missing, sample: rows[0] ?? null });
});

router.get('/data', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM farmacia_datos ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
