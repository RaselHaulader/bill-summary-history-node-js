const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  bill_amount: Number,
  deu_amount: Number
}, { collection: 'bill' });

module.exports = mongoose.model('Bill', BillSchema);
