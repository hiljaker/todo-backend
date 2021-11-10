//? third-party
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

//! routes
app.use('/activities', require('./src/routes/activitiesRoutes')); // * use verify jwt middleware

app.all('*', (req, res) => res.status(404).json({ message: 'not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`running on: http://localhost:${PORT}`);
});
