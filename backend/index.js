const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRouter = require('./routes/upload');
const syncRouter = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRouter);
app.use('/api/sync', syncRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
