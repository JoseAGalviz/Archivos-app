const express = require('express');
const pool = require('../db/connection');
const { getPool, sql } = require('../db/sqlserver');

const router = express.Router();

router.post('/profit', async (req, res) => {
  try {
    // Get all sicm values from MySQL
    const [mysqlRows] = await pool.query('SELECT DISTINCT sicm FROM farmacia_datos WHERE sicm IS NOT NULL');
    if (mysqlRows.length === 0) return res.json({ updated: 0 });

    const sicmList = mysqlRows.map((r) => r.sicm);

    // Query SQL Server in batches of 2000 (max 2100 params)
    const ssPool = await getPool();
    const BATCH_SIZE = 2000;
    const lookup = {};

    for (let i = 0; i < sicmList.length; i += BATCH_SIZE) {
      const batch = sicmList.slice(i, i + BATCH_SIZE);
      const request = ssPool.request();
      const paramList = batch.map((_, j) => `@s${i + j}`).join(', ');
      batch.forEach((sicm, j) => request.input(`s${i + j}`, sql.VarChar, String(sicm)));
      const ssResult = await request.query(
        `SELECT LTRIM(RTRIM(nit)) AS nit_clean, rif, horar_caja, co_cli
         FROM clientes
         WHERE LTRIM(RTRIM(nit)) IN (${paramList})`
      );
      for (const row of ssResult.recordset) {
        lookup[row.nit_clean] = row;
      }
    }

    if (Object.keys(lookup).length === 0) return res.json({ updated: 0 });

    // Bulk update MySQL
    let updated = 0;
    for (const sicm of sicmList) {
      const match = lookup[String(sicm)];
      if (!match) continue;
      await pool.query(
        `UPDATE farmacia_datos SET rif = ?, clasificacion_horar_caja = ?, codigo_profit = ? WHERE sicm = ?`,
        [match.rif ?? null, match.horar_caja ?? null, match.co_cli ?? null, sicm]
      );
      updated++;
    }

    res.json({ updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
