const mongoose = require('mongoose');
const PersonSchema = new mongoose.Schema({
  name: String,
  due: Number
}, { collection: 'people' });

module.exports = mongoose.model('Person', PersonSchema);
