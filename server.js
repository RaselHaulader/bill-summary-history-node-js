require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const billRoutes = require('./routes/bill');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error', err));

app.use('/api', billRoutes);


app.get('/', (req, res) => {
  res.send('hello')
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
