const mongoose = require('mongoose');
const HistorySchema = new mongoose.Schema({
  name: String, amount: Number, bill_type: String, date: String
}, { collection: 'history' });

module.exports = mongoose.model('History', HistorySchema);
